/**
 * API Key 管理接口
 * GET  - 获取用户的所有API Keys
 * POST - 创建新的API Key
 */

import { ApiKeyManager } from '../lib/api-key-manager.js'

// GET - 获取用户的所有API Keys
export const onRequestGet = async (context) => {
  const { env, data } = context
  const userId = data.userId // 从中间件获取

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const manager = new ApiKeyManager(env)
    const result = await manager.getUserKeys(userId)

    if (!result.success) {
      console.error('Get keys error:', result.error)
      return Response.json({ error: 'Failed to fetch API keys' }, { status: 500 })
    }

    // 格式化返回数据
    const keys = result.keys.map((key) => ({
      id: key.id,
      name: key.name,
      prefix: key.key_prefix,
      usage: {
        total: key.use_count || 0,
        lastUsed: key.last_used_at
      },
      limits: {
        ratePerMinute: key.rate_limit,
        daily: key.daily_limit
      },
      status: {
        active: key.is_active === 1,
        revoked: key.is_revoked === 1,
        expiresAt: key.expires_at
      },
      createdAt: key.created_at
    }))

    return Response.json({
      success: true,
      data: { keys }
    })
  } catch (error) {
    console.error('Get keys error:', error)
    return Response.json(
      {
        error: 'Failed to fetch API keys'
      },
      { status: 500 }
    )
  }
}

// POST - 创建新的API Key
export const onRequestPost = async (context) => {
  const { request, env, data } = context
  const userId = data.userId

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, ...options } = body

    if (!name || name.trim().length === 0) {
      return Response.json(
        {
          error: 'Invalid name',
          message: 'API Key名称不能为空'
        },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()
    if (trimmedName.length > 100) {
      return Response.json(
        {
          error: 'Name too long',
          message: 'API Key名称不能超过100个字符'
        },
        { status: 400 }
      )
    }

    // 检查名称是否重复
    const existingKey = await env.DB.prepare(
      `SELECT id FROM api_keys WHERE user_id = ? AND name = ?`
    )
      .bind(userId, name.trim())
      .first()

    if (existingKey) {
      return Response.json(
        {
          error: 'Duplicate name',
          message: '该名称已存在，请使用其他名称'
        },
        { status: 400 }
      )
    }

    // 限制每个用户最多创建10个活跃Key
    const existingKeys = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM api_keys
       WHERE user_id = ? AND is_revoked = 0`
    )
      .bind(userId)
      .first()

    if (existingKeys.count >= 10) {
      return Response.json(
        {
          error: 'Limit exceeded',
          message: '每个用户最多创建10个活跃API Key'
        },
        { status: 400 }
      )
    }

    const manager = new ApiKeyManager(env)
    const result = await manager.createKey(userId, trimmedName, {
      rateLimit: options.rateLimit,
      dailyLimit: options.dailyLimit,
      expiresAt: options.expiresAt
    })

    if (!result.success) {
      console.error('Create key error:', result.error)
      return Response.json({ error: 'Failed to create API key' }, { status: 500 })
    }

    return Response.json(
      {
        success: true,
        data: {
          id: result.keyId,
          key: result.key,
          prefix: result.prefix,
          message: result.message
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create key error:', error)
    return Response.json(
      {
        error: 'Failed to create API key'
      },
      { status: 500 }
    )
  }
}
