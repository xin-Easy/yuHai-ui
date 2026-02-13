import { coreRequest, CORE_BASE_URL } from '@/utils/http/core'

export interface NoteResource {
  id: number
  note_id: string
  url: string
  type: string
  [key: string]: any
}

export interface NoteDetail {
  note_id: string
  title: string
  desc: string
  type: string
  user: {
    nickname: string
    avatar: string
    user_id: string
  }
  [key: string]: any
}

export interface NoteSearchParams {
  keyword?: string
  note_type?: string
  user_id?: string
  daterange?: string[]
  sort_by?: string
  sort_order?: string
  page?: number
  page_size?: number
}

export interface NoteListResponse {
  items: NoteDetail[]
  total: number
  page: number
  per_page: number
  pages: number
}

// =================================================================================
// Note Management (Original notes.ts)
// =================================================================================

export function getNoteCount() {
  return coreRequest.get<number>('/api/v1/note/count')
}

export function getNoteList(params: { page?: number; per_page?: number; search?: string }) {
  return coreRequest.get<{
    notes: any[]
    total: number
    page: number
    per_page: number
    pages: number
  }>('/api/v1/note/list', { params })
}

export function getNoteDetail(note_id: string) {
  return coreRequest.get(`/api/v1/note/${note_id}`)
}

export function deleteNote(note_id: string) {
  return coreRequest.delete(`/api/v1/note/${note_id}`)
}

import { downloadBlob } from '@/utils/download'

export async function exportNotesToExcel(params: {
  search?: string
  start_date?: string
  end_date?: string
}) {
  const data = await coreRequest.get<Blob>('/api/v1/note/export/excel', {
    params,
    responseType: 'blob'
  })
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  await downloadBlob(blob, 'notes.xlsx')
}

export function batchDeleteNotes(note_ids: string[]) {
  return coreRequest.post('/api/v1/note/batch/delete', { note_ids })
}

export function collectNotes(payload: {
  keywords: string
  filter_keywords?: string[]
  collect_count?: number
  after_time?: string
  liked_count_big_than?: number
  collected_count_big_than?: number
  comment_count_big_than?: number
  shared_count_big_than?: number
}) {
  return coreRequest.post('/api/v1/note/collect', payload)
}

export function searchNotes(payload: {
  keyword?: string
  note_type?: string
  user_id?: string
  date_range?: { start?: string; end?: string }
  page?: number
  page_size?: number
}) {
  return coreRequest.post<{
    notes: any[]
    total: number
    page: number
    per_page: number
    pages: number
  }>('/api/v1/note/search', payload)
}

// =================================================================================
// Note Detail Management (Original noteDetail.ts)
// =================================================================================

export function getCurrentNoteDetailInfo() {
  return coreRequest.post('/api/v1/note_detail/current/info')
}

export function publishNote(note_id: string) {
  return coreRequest.get(`/api/v1/note_detail/publish/${note_id}`)
}

export function rewriteNote(payload: { note_id: string; style?: string; model?: string }) {
  return coreRequest.post('/api/v1/note_detail/rewrite', payload)
}

export async function exportNoteDetailExcel() {
  const data = await coreRequest.get<Blob>('/api/v1/note_detail/export/excel', {
    responseType: 'blob'
  })
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const now = new Date()
  const timestamp = Math.floor(now.getTime() / 1000)
  await downloadBlob(blob, `note_details_export_${timestamp}.xlsx`)
}

export function searchNoteDetails(payload: NoteSearchParams) {
  return coreRequest.post<NoteListResponse>('/api/v1/note_detail/search', payload)
}

export function getNoteDetailInfo(note_id: string) {
  return coreRequest.get<NoteDetail>(`/api/v1/note_detail/${note_id}`)
}

export function noteDetailStats() {
  return coreRequest.get('/api/v1/note_detail/stats')
}

export function deduplicateResources(payload: {
  resource_ids: number[]
  modification_ratio: number
  video_frame_count: number
}) {
  return coreRequest.post('/api/v1/note_detail_resource/resource/deduplicate', payload)
}

export function addResources(note_id: string, files: File[]) {
  const fd = new FormData()
  fd.append('note_id', note_id)
  files.forEach((f) => fd.append('files', f))
  return coreRequest.post('/api/v1/note_detail_resource/resource/add', fd)
}

export function getNoteResourceImageUrl(resource_id: string | number) {
  return `${CORE_BASE_URL}/api/v1/note_detail_resource/resource/image/${resource_id}`
}
