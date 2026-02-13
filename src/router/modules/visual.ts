import { AppRouteRecord } from '@/types/router'

export const visualRoutes: AppRouteRecord = {
  path: '/visual',
  name: 'VisualRoot',
  component: '/index/index',
  meta: {
    title: 'menus.visual.title',
    icon: 'ri:dashboard-line',
    single: true
  },
  children: [
    {
      path: '',
      name: 'VisualDashboard',
      component: '/dashboard/Dashboard',
      meta: {
        title: 'menus.visual.title',
        icon: 'ri:dashboard-line',
        keepAlive: false
      }
    }
  ]
}
