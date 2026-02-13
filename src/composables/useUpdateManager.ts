/**
 * 通用更新管理 Composable
 */
import { ref, reactive } from 'vue'
import { formatTime } from '@/utils/update'

// 日志类型
export type LogType = 'info' | 'success' | 'warning' | 'error'

// 日志条目接口
export interface LogEntry {
  id: number
  message: string
  type: LogType
  timestamp: number
}

// 通用更新状态接口
export interface BaseUpdateState {
  checking: boolean
  downloading: boolean
  downloaded: boolean
  available: boolean
  error: string | null
  currentVersion?: string
}

/**
 * 使用更新管理器
 */
export function useUpdateManager() {
  // 日志管理
  const logs = ref<LogEntry[]>([])
  let logIdCounter = 0

  // 添加日志
  const addLog = (message: string, type: LogType = 'info'): void => {
    const logEntry: LogEntry = {
      id: ++logIdCounter,
      message,
      type,
      timestamp: Date.now()
    }
    logs.value.push(logEntry)

    // 限制日志数量，避免内存泄漏
    if (logs.value.length > 1000) {
      logs.value = logs.value.slice(-500)
    }
  }

  // 清空日志
  const clearLogs = (): void => {
    logs.value = []
    logIdCounter = 0
  }

  // 创建更新状态
  const createUpdateState = <T extends BaseUpdateState>(initialState: T) => {
    return reactive(initialState)
  }

  // 格式化日志时间
  const formatLogTime = (timestamp: number): string => {
    return formatTime(timestamp)
  }

  // 获取日志类型对应的图标
  const getLogIcon = (type: LogType): string => {
    const iconMap = {
      info: 'InfoFilled',
      success: 'SuccessFilled',
      warning: 'WarningFilled',
      error: 'CircleCloseFilled'
    }
    return iconMap[type]
  }

  // 获取日志类型对应的颜色
  const getLogColor = (type: LogType): string => {
    const colorMap = {
      info: '#409eff',
      success: '#67c23a',
      warning: '#e6a23c',
      error: '#f56c6c'
    }
    return colorMap[type]
  }

  return {
    // 状态
    logs,

    // 方法
    addLog,
    clearLogs,
    createUpdateState,
    formatLogTime,
    getLogIcon,
    getLogColor
  }
}

/**
 * 使用日志管理器 (简化版本，仅用于日志功能)
 */
export function useLogManager() {
  const logs = ref<LogEntry[]>([])
  let logIdCounter = 0

  const addLog = (message: string, type: LogType = 'info'): void => {
    const logEntry: LogEntry = {
      id: ++logIdCounter,
      message,
      type,
      timestamp: Date.now()
    }
    logs.value.push(logEntry)

    if (logs.value.length > 1000) {
      logs.value = logs.value.slice(-500)
    }
  }

  const clearLogs = (): void => {
    logs.value = []
  }

  return {
    logs,
    addLog,
    clearLogs
  }
}

/**
 * 使用更新操作
 */
export function useUpdateOperations(addLog: (message: string, type: LogType) => void) {
  // 执行更新操作的通用函数
  const executeUpdateOperation = async <T>(
    operation: () => Promise<T>,
    state: any,
    stateKey: string,
    startMessage: string,
    successMessage: string,
    operationName: string
  ): Promise<T | null> => {
    try {
      state[stateKey] = true
      state.error = null
      addLog(startMessage, 'info')

      const result = await operation()
      addLog(successMessage, 'success')
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${operationName}失败`
      state.error = errorMessage
      addLog(`${operationName}失败: ${errorMessage}`, 'error')
      return null
    } finally {
      state[stateKey] = false
    }
  }

  return {
    executeUpdateOperation
  }
}
