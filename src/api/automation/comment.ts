import { coreRequest } from '@utils/http/core.ts'

export function getCommentCount() {
  return coreRequest.get<number>('/api/v1/comment/count')
}

export function getCommentList(params: { page?: number; per_page?: number; search?: string }) {
  return coreRequest.get<{ items: any[]; pagination: any }>('/api/v1/comment/list', { params })
}

export function getCurrentComments(payload: {
  note_id: string
  page?: number
  page_size?: number
  keywords?: string
}) {
  return coreRequest.post('/api/v1/comment/current/comments', payload)
}

export function getCommentsByNote(payload: {
  note_id: string
  page?: number
  page_size?: number
  keywords?: string
}) {
  return coreRequest.post('/api/v1/comment/comments/by-note', payload)
}

import { downloadBlob } from '@/utils/download'

export async function exportCommentsExcel(payload: {
  keyword?: string
  note_id?: string
  user_id?: string
  start_date?: string
  end_date?: string
  sort_by?: string
  sort_order?: string
}) {
  const data = await coreRequest.post<Blob>('/api/v1/comment/export/excel', payload, {
    responseType: 'blob'
  })
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const now = new Date()
  const timestamp = now
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 14)
  await downloadBlob(blob, `comments_${timestamp}.xlsx`)
}

export function searchComments(payload: {
  keyword?: string
  note_id?: string
  user_id?: string
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
  sort_by?: 'create_time' | 'like_count'
  sort_order?: 'asc' | 'desc'
}) {
  return coreRequest.post<{ items: any[]; pagination: any }>('/api/v1/comment/search', payload)
}
