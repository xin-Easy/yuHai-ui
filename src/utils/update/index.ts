/**
 * 更新系统通用工具函数
 */

// 格式化字节大小
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
export const formatDate = (date: string | number | undefined): string => {
  if (!date) return '未知时间'
  let d: Date
  if (typeof date === 'number') {
    // If < 1e11, assume seconds (e.g. 1763559790 is ~2025, 1.7e9).
    // MS is 1.7e12.
    d = new Date(date < 10000000000 ? date * 1000 : date)
  } else {
    d = new Date(date)
  }
  return d.toLocaleString('zh-CN')
}

// 格式化时间
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

// 通用错误处理函数
export const handleUpdateError = (
  error: unknown,
  operation: string,
  logFunction: (message: string, type: string) => void
): string => {
  const errorMessage = error instanceof Error ? error.message : `${operation}失败`
  logFunction(`${operation}失败: ${errorMessage}`, 'error')
  return errorMessage
}

// 通用状态标签类型获取函数
export type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'
export type TagEffect = 'dark' | 'light' | 'plain'

export const getStatusTagType = (state: {
  checking?: boolean
  error?: string
  downloaded?: boolean
  downloading?: boolean
  available?: boolean
}): TagType => {
  if (state.checking) return 'warning'
  if (state.error) return 'danger'
  if (state.downloaded) return 'success'
  if (state.downloading) return 'warning'
  if (state.available) return 'primary'
  return 'info'
}

// 通用状态效果获取函数
export const getStatusEffect = (state: {
  checking?: boolean
  downloading?: boolean
}): TagEffect => {
  if (state.checking || state.downloading) return 'plain'
  return 'dark'
}

export const getStatusText = (state: {
  checking?: boolean
  error?: string
  downloaded?: boolean
  downloading?: boolean
  available?: boolean
}): string => {
  if (state.checking) return '检查中'
  if (state.error) return '检查失败'
  if (state.downloaded) return '已下载'
  if (state.downloading) return '下载中'
  if (state.available) return '有新版本'
  return '已是最新'
}

// 通用更新操作函数
export const performUpdateOperation = async <T>(
  operation: () => Promise<T>,
  state: any,
  stateKey: string,
  startMessage: string,
  successMessage: string,
  operationName: string,
  addLog: (message: string, type: string) => void
): Promise<T | null> => {
  try {
    state[stateKey] = true
    state.error = null
    addLog(startMessage, 'info')

    const result = await operation()
    addLog(successMessage, 'success')
    return result
  } catch (error) {
    state.error = handleUpdateError(error, operationName, addLog)
    return null
  } finally {
    state[stateKey] = false
  }
}
