import { coreRequest } from '@/utils/http/core'

export interface ConfigItem {
  id?: number
  key: string
  value: any
  description?: string
}

export interface ConfigCreate {
  key: string
  value: any
  description?: string
}

export interface ConfigUpdate {
  value?: any
  description?: string
}

/**
 * 获取所有自定义配置列表
 */
export function getAllConfigs() {
  return coreRequest.get<ConfigItem[]>('/api/v1/system/configs')
}

/**
 * 创建配置
 */
export function createConfig(data: ConfigCreate) {
  return coreRequest.post<ConfigItem>('/api/v1/system/config', data)
}

/**
 * 获取指定配置的值
 */
export function getConfig(key: string) {
  return coreRequest.get<ConfigItem>(`/api/v1/system/config/${key}`)
}

/**
 * 更新配置
 */
export function updateConfig(key: string, data: ConfigUpdate) {
  return coreRequest.put<ConfigItem>(`/api/v1/system/config/${key}`, data)
}

/**
 * 删除自定义配置（恢复默认值）
 */
export function deleteConfig(key: string) {
  return coreRequest.delete(`/api/v1/system/config/${key}`)
}
