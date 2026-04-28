/**
 * 示例API接口 - 展示如何使用API Key
 *
 * 这个接口展示了如何使用新的认证系统
 * 支持两种认证方式：
 * 1. Clerk Token（用户登录）
 * 2. API Key（第三方应用）
 */

// GET - 获取用户数据（两种认证方式都支持）
export const onRequestGet = async (context) => {
  const { env, data } = context
  const userId = data.userId
  const authType = data.authType // 'clerk' 或 'api_key'
  const keyId = data.keyId // 如果是API Key，会有这个值

  try {
    // 查询用户数据
    const { results } = await env.DB.prepare(`SELECT * FROM user_profiles WHERE clerk_user_id = ?`)
      .bind(userId)
      .all()

    let profile = results.length > 0 ? results[0] : null

    // 如果是API Key用户但还没有profile，自动创建
    if (!profile && authType === 'api_key') {
      await env.DB.prepare(`INSERT INTO user_profiles (clerk_user_id) VALUES (?)`)
        .bind(userId)
        .run()

      profile = {
        clerk_user_id: userId,
        nickname: `API User ${userId.substring(0, 8)}`,
        avatar_url: null
      }
    }

    return Response.json({
      success: true,
      data: {
        userId,
        authType,
        keyId: keyId || null,
        profile
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    })
  } catch (error) {
    return Response.json(
      {
        error: 'Database error',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// POST - 更新用户数据
export const onRequestPost = async (context) => {
  const { request, env, data } = context
  const userId = data.userId

  try {
    const body = await request.json()
    const { nickname, avatar_url } = body

    const info = await env.DB.prepare(
      `INSERT INTO user_profiles (clerk_user_id, nickname, avatar_url)
       VALUES (?, ?, ?)
       ON CONFLICT(clerk_user_id)
       DO UPDATE SET
         nickname = excluded.nickname,
         avatar_url = excluded.avatar_url`
    )
      .bind(userId, nickname, avatar_url)
      .run()

    return Response.json({
      success: true,
      message: 'Profile updated successfully',
      changes: info.meta?.changes
    })
  } catch (error) {
    return Response.json(
      {
        error: 'Update failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}
