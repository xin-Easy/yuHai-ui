import { verifyToken } from '@clerk/backend'
import { ApiKeyManager } from '../lib/api-key-manager.js'

// 这是一个全局的中间件，由于文件放在 api 目录下，它只会拦截以 /api/ 开头的请求
export const onRequest = async (context) => {
  const { request, env, next, data } = context

  // 尝试API Key认证
  const apiKeyResult = await tryApiKeyAuth(request, env, data)
  if (apiKeyResult.authorized) {
    return next()
  }

  // 尝试Clerk Token认证
  const tokenResult = await tryClerkAuth(request, env, data)
  if (tokenResult.authorized) {
    return next()
  }

  // 两种认证都失败
  return Response.json(
    {
      error: 'Unauthorized',
      message: apiKeyResult.error || tokenResult.error || 'Missing or invalid authentication',
      hints: [
        '使用Clerk: 在Header中添加 "Authorization: Bearer <clerk_session_token>"',
        '使用API Key: 在Header中添加 "X-API-Key: <your_api_key>"'
      ]
    },
    { status: 401 }
  )
}

/**
 * API Key认证
 */
async function tryApiKeyAuth(request, env, data) {
  const apiKey = request.headers.get('X-API-Key')

  if (!apiKey) {
    return { authorized: false, error: 'Missing API Key' }
  }

  try {
    const clientIP = getClientIP(request)
    const manager = new ApiKeyManager(env)
    const result = await manager.verifyKey(apiKey, clientIP)

    if (!result.valid) {
      return { authorized: false, error: result.error }
    }

    // 记录API使用日志
    await logApiUsage(env, request, result.keyData, clientIP)

    // 检查限流
    const rateLimit = await manager.checkRateLimit(result.keyData, clientIP)
    if (!rateLimit.allowed) {
      return Response.json(
        {
          error: 'Rate limit exceeded',
          message: rateLimit.error,
          limit: rateLimit.limit,
          resetTime: rateLimit.resetTime
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime,
            'Retry-After': '60'
          }
        }
      )
    }

    // 认证成功，注入数据
    data.authType = 'api_key'
    data.userId = result.keyData.user_id
    data.keyId = result.keyData.id
    data.keyData = result.keyData
    data.clientIP = clientIP

    return { authorized: true }
  } catch (error) {
    console.error('API Key auth error:', error)
    return { authorized: false, error: 'API Key verification failed' }
  }
}

function getClientIP(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    request.headers.get('X-Real-IP') ||
    'unknown'
  )
}

async function logApiUsage(env, request, keyData, clientIP) {
  try {
    const startTime = Date.now()
    const method = request.method
    const url = new URL(request.url)
    const path = url.pathname
    const queryParams = url.search || null

    await env.DB.prepare(
      `INSERT INTO api_usage_logs
       (key_id, user_id, method, path, query_params, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(keyData.id, keyData.user_id, method, path, queryParams, clientIP)
      .run()
  } catch (error) {
    console.error('Failed to log API usage:', error)
  }
}

/**
 * Clerk Token认证
 */
async function tryClerkAuth(request, env, data) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing Authorization header' }
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY
    })

    data.authType = 'clerk'
    data.userId = payload.sub
    data.keyId = null
    data.keyPermissions = null

    return { authorized: true }
  } catch (error) {
    console.error('Clerk auth error:', error)
    return { authorized: false, error: 'Token is invalid or expired' }
  }
}
