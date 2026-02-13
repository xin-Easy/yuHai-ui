import { coreRequest } from '@utils/http/core.ts'

export type ProxyProtocol = 'HTTP' | 'HTTPS' | 'SOCKS5'

export interface ProxyItem {
  id: number
  name: string
  protocol: ProxyProtocol
  host: string
  port: number
  username?: string | null
  password?: string | null
  status?: number | null
  description?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ProxyListResponse {
  items: ProxyItem[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ProxyCreateRequest {
  name: string
  protocol: ProxyProtocol
  host: string
  port: number
  username?: string
  password?: string
  status?: number
  description?: string
}

export interface ProxyUpdateRequest extends Partial<ProxyCreateRequest> {}

export function getProxyList(params: { page?: number; per_page?: number; search?: string }) {
  return coreRequest.get<ProxyListResponse>('/api/v1/proxy/list', { params })
}

export function getProxyDetail(id: number) {
  return coreRequest.get<ProxyItem>(`/api/v1/proxy/${id}`)
}

export function addProxy(data: ProxyCreateRequest) {
  return coreRequest.post<ProxyItem>('/api/v1/proxy/add', data)
}

export function updateProxy(id: number, data: ProxyUpdateRequest) {
  return coreRequest.put<ProxyItem>(`/api/v1/proxy/update/${id}`, data)
}

export function deleteProxy(id: number) {
  return coreRequest.delete(`/api/v1/proxy/delete/${id}`)
}
