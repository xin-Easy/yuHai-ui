import { coreRequest } from '@utils/http/core.ts'

// Data Models
export interface AgentTemplateParam {
  name: string
  description: string
  default: string
}

export interface AgentTemplate {
  id: string
  name: string
  description: string
  params: AgentTemplateParam[]
}

export interface StartAgentTaskRequest {
  template_id: string
  template_params: Record<string, any>
  // Stop conditions
  max_count?: number
  max_notes_count?: number
  max_comments_count?: number
  max_duration?: number
  max_consecutive_failures?: number
}

export interface CreateCommentTaskRequest {
  note_id?: string
  note_url: string
  max_count?: number
  max_duration?: number
  max_consecutive_failures?: number
}

export interface Task {
  task_id: string
  type: string
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'stopped'
  target_count?: number
  current_count?: number
  params?: any
  message?: string
  created_at?: string
  updated_at?: string
}

export interface TaskListResponse {
  items: Task[]
  total: number
}

// Agent APIs
export function getAgentTemplates() {
  return coreRequest.get<AgentTemplate[]>('/api/v1/tasks/agent/templates')
}

export function startAgentTask(data: StartAgentTaskRequest) {
  return coreRequest.post<{ task_id: string }>('/api/v1/tasks/agent/start', data)
}

export function stopAgentTask() {
  return coreRequest.post<{ task_id: string }>('/api/v1/tasks/agent/stop')
}

// Crawler APIs
export function createCommentTask(data: CreateCommentTaskRequest) {
  return coreRequest.post<{ task_id: string }>('/api/v1/tasks/comments/collect', data)
}

// Task Management APIs
export function getTasks(params?: any) {
  return coreRequest.get<Task[]>('/api/v1/tasks/', { params })
}

export interface TaskStats {
  notes: number
  comments: number
  consecutive_failures: number
}

export interface TaskStatusResponse extends Task {
  stop_condition: {
    max_count: number
    max_notes_count: number
    max_comments_count: number
    max_duration: number
    max_consecutive_failures: number
  }
  stats?: Partial<TaskStats> & Record<string, any>
}

export function normalizeTaskStats(stats?: any): TaskStats {
  const s = stats || {}
  return {
    notes: s.notes ?? s.notes_count ?? 0,
    comments: s.comments ?? s.comments_count ?? 0,
    consecutive_failures: s.consecutive_failures ?? s.consecutive_failures_count ?? 0
  }
}

export function getTaskStatus(taskId: string) {
  return coreRequest.get<TaskStatusResponse>(`/api/v1/tasks/${taskId}/status`)
}

export function getTaskDetail(taskId: string) {
  return coreRequest.get<Task>(`/api/v1/tasks/${taskId}`)
}

export function stopTask(taskId: string) {
  return coreRequest.post(`/api/v1/tasks/${taskId}/stop`)
}

export function deleteTask(taskId: string) {
  return coreRequest.delete(`/api/v1/tasks/${taskId}`)
}

export function getTaskNotes(taskId: string, params?: { page?: number; size?: number }) {
  return coreRequest.get(`/api/v1/tasks/${taskId}/notes`, { params })
}

export function getTaskComments(taskId: string, params?: { page?: number; size?: number }) {
  return coreRequest.get(`/api/v1/tasks/${taskId}/comments`, { params })
}

export function getTaskNoteDetails(taskId: string, params?: { page?: number; size?: number }) {
  return coreRequest.get(`/api/v1/tasks/${taskId}/note-details`, { params })
}
