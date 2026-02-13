import { AppRouteRecord } from '@/types/router'
import { homeRoutes } from './home'
import { coreRoutes } from './core'
import { updateRoutes } from './update'
import { visualRoutes } from './visual'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  homeRoutes,
  visualRoutes,
  ...coreRoutes,
  updateRoutes
]
