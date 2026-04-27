/**
 * 统一日志工具
 *
 * 提供带模块标记的日志输出，生产环境自动禁用 debug 日志
 *
 * @module utils/logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = import.meta.env.DEV

const createLogger = (prefix: string) => {
  const log = (level: LogLevel, ...args: unknown[]) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const formattedPrefix = `[${timestamp}][${prefix}]`

    switch (level) {
      case 'debug':
        if (isDev) console.debug(formattedPrefix, ...args)
        break
      case 'info':
        if (isDev) console.info(formattedPrefix, ...args)
        break
      case 'warn':
        console.warn(formattedPrefix, ...args)
        break
      case 'error':
        console.error(formattedPrefix, ...args)
        break
    }
  }

  return {
    debug: (...args: unknown[]) => log('debug', ...args),
    info: (...args: unknown[]) => log('info', ...args),
    warn: (...args: unknown[]) => log('warn', ...args),
    error: (...args: unknown[]) => log('error', ...args)
  }
}

export const logger = {
  create: createLogger,

  core: createLogger('Core'),
  http: createLogger('Http'),
  table: createLogger('Table'),
  chart: createLogger('Chart'),
  update: createLogger('Update'),

  default: createLogger('App')
}

export default logger
