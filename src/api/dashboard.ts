import { coreRequest } from '@/utils/http/core'

// -- Interfaces --

export interface OverviewCard {
  title: string
  value: number | string
  unit: string
  trend: number | null
  trend_type: 'up' | 'down' | 'flat'
}

export interface OverviewResponse {
  cards: OverviewCard[]
}

export interface TrendItem {
  date: string
  value: number
  category?: string | null
}

export interface NoteTrendsResponse {
  items: TrendItem[]
}

export interface DistributionItem {
  name: string
  value: number
  percentage: number
}

export interface DistributionResponse {
  items: DistributionItem[]
}

export interface RankItem {
  id: number
  title: string
  cover_url: string
  cover_resource_id?: number // Added for secured image loading
  author: string
  score: number
  publish_time: string
}

export interface RankResponse {
  items: RankItem[]
}

export interface WordCloudItem {
  text: string
  value: number
}

export interface WordCloudResponse {
  items: WordCloudItem[]
}

export interface HeatmapItem {
  x: string
  y: number
}

export interface HeatmapResponse {
  items: HeatmapItem[]
}

export interface GeoItem {
  name: string
  value: number
}

export type GeoResponse = GeoItem[] | { items: GeoItem[] }

// -- API Functions --

/**
 * 获取核心指标概览
 */
export const getOverview = () => {
  return coreRequest.get<OverviewResponse>('/api/dashboard/overview')
}

/**
 * 获取笔记发布趋势
 * @param days 天数
 */
export const getNoteTrends = (days: number = 30) => {
  return coreRequest.get<NoteTrendsResponse>('/api/dashboard/trends/notes', {
    params: { days }
  })
}

/**
 * 获取笔记类型分布
 */
export const getNoteTypeDistribution = () => {
  return coreRequest.get<DistributionResponse>('/api/dashboard/distribution/note-type')
}

/**
 * 获取任务状态分布
 */
export const getTaskStatusDistribution = () => {
  return coreRequest.get<DistributionResponse>('/api/dashboard/distribution/task-status')
}

/**
 * 获取热门笔记排行
 * @param limit 数量限制
 */
export const getNoteRank = (limit: number = 10) => {
  return coreRequest.get<RankResponse>('/api/dashboard/rank/notes', {
    params: { limit }
  })
}

/**
 * 获取热门词云
 * @param limit 数量限制
 */
export const getWordCloud = (limit: number = 50) => {
  return coreRequest.get<WordCloudResponse>('/api/dashboard/analysis/word-cloud', {
    params: { limit }
  })
}

/**
 * 获取发布时间热力图
 */
export const getHeatmap = () => {
  return coreRequest.get<HeatmapResponse>('/api/dashboard/analysis/heatmap')
}

/**
 * 获取地域分布
 */
export const getGeoDistribution = () => {
  return coreRequest.get<GeoResponse>('/api/dashboard/analysis/geo')
}
