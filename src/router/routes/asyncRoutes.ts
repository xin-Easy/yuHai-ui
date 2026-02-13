// 动态路由
import { AppRouteRecord } from '@/types/router'
import { routeModules } from '../modules'

/**
 * 动态路由
 * 用于渲染菜单以及动态加载路由
 */
export const asyncRoutes: AppRouteRecord[] = routeModules
