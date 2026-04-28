/**
 * API Key 操作接口
 * DELETE - 删除API Key（硬删除，从数据库彻底移除）
 * GET    - 获取Key使用统计
 */

import { ApiKeyManager } from '../lib/api-key-manager.js'

// DELETE - 硬删除API Key（从数据库彻底删除）
export const onRequestDelete = async (context) => {
  const { request, env, data } = context
  const userId = data.userId

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const keyId = url.searchParams.get('id')

    if (!keyId) {
      return Response.json(
        {
          error: 'Invalid request',
          message: '缺少Key ID参数'
        },
        { status: 400 }
      )
    }

    const manager = new ApiKeyManager(env)

    // 使用硬删除而不是软撤销
    const result = await manager.deleteKey(userId, keyId)

    if (!result.success) {
      console.error('Delete key error:', result.error)
      return Response.json({ error: 'Failed to delete API key' }, { status: 500 })
    }

    return Response.json({
      success: true,
      message: 'API Key已成功删除'
    })
  } catch (error) {
    console.error('Delete key error:', error)
    return Response.json(
      {
        error: 'Failed to delete API key'
      },
      { status: 500 }
    )
  }
}

// GET - 获取Key使用统计
export const onRequestGet = async (context) => {
  const { request, env, data } = context
  const userId = data.userId

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const keyId = url.searchParams.get('id')
    const days = parseInt(url.searchParams.get('days')) || 7

    if (!keyId) {
      return Response.json(
        {
          error: 'Invalid request',
          message: '缺少Key ID参数'
        },
        { status: 400 }
      )
    }

    const manager = new ApiKeyManager(env)
    const result = await manager.getKeyStats(userId, keyId, days)

    if (!result.success) {
      console.error('Get stats error:', result.error)
      return Response.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }

    return Response.json({
      success: true,
      data: {
        stats: result.stats,
        period: `最近${days}天`
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return Response.json(
      {
        error: 'Failed to fetch statistics'
      },
      { status: 500 }
    )
  }
}
