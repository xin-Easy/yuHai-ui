import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useSettingStore } from '@/store/modules/setting'

// 核心服务基础地址
// 开发环境下使用 /core-api 走代理，生产环境或 Electron 环境使用绝对地址
export const CORE_BASE_URL = import.meta.env.DEV
  ? '/core-api'
  : import.meta.env.VITE_CORE_API_URL

if (import.meta.env.DEV) {
  console.log('[Core API] Base URL:', CORE_BASE_URL)
}

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: CORE_BASE_URL,
  timeout: 15000, // 请求超时时间
  validateStatus: (status) => status >= 200 && status < 300
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 可以在这里添加核心服务需要的特定 Headers，例如 API Key 等
    const settingStore = useSettingStore()
    if (settingStore.tenantScope) {
      config.headers['X-Tenant-Scope'] = settingStore.tenantScope
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 针对核心服务的响应结构进行处理
    // 假设核心服务成功返回 code: 0 或 200
    if (res.code === 0 || res.code === 200) {
      return res.data
    }

    // 如果是直接返回数据（非标准信封结构），或者某些特殊接口，可能需要调整判断
    // 这里保留原有逻辑：如果 code 不存在，可能不是标准 JSON 响应（如文件流）
    if (res.code === undefined) {
      return res
    }

    return Promise.reject(new Error(res.message || 'Error'))
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 封装通用请求方法
export const coreRequest = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  },

  // 暴露原始实例用于特殊需求
  instance: service,

  // 暴露 Base URL
  baseURL: CORE_BASE_URL
}

export default coreRequest
