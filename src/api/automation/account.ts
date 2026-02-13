import { coreRequest } from '@utils/http/core.ts'

export interface AccountItem {
  id: number
  name: string | null
  red_book_id: string | null
  follow_count: string | null
  fans_count: string | null
  likes_and_collections: string | null
  cookie: string | null
  first_login_time: string | null
  login_time: string | null
  last_login_time: string | null
  ip_location: string | null
  description: string | null
  avatar_small: string | null
  avatar_large: string | null
  gender: number | null
}

export interface AccountListResponse {
  items: AccountItem[]
  total: number
  page: number
  size: number
  pages: number
}

export interface AddAccountResponse {
  id: number
  tenant_id: string
}

export function addCookie(cookie: string) {
  return coreRequest.post<AddAccountResponse>('/api/v1/account/addCookie', { cookie })
}

export function setBrowserHeadless(status: 0 | 1) {
  return coreRequest.post(`/api/v1/account/browser/headless/${status}`)
}

export function restartBrowser() {
  return coreRequest.post('/api/v1/account/browser/restart')
}

export function getAccounts(params: { page?: number; per_page?: number; search?: string }) {
  return coreRequest.get<AccountListResponse>('/api/v1/account/list', { params })
}

export function getAccount(id: number) {
  return coreRequest.get<AccountItem>(`/api/v1/account/${id}`)
}

export function deleteAccount(id: number) {
  return coreRequest.delete(`/api/v1/account/delete/${id}`)
}
