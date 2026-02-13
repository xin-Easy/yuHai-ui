import { AppRouteRecord } from '@/types/router'

export const updateRoutes: AppRouteRecord = {
  name: 'Update',
  path: '/update',
  component: '/index/index',
  meta: {
    title: 'menus.update.title',
    icon: 'ri:download-cloud-2-line'
  },
  children: [
    {
      path: 'index',
      name: 'UpdateCenter',
      component: '/update/index',
      meta: {
        title: 'menus.update.center',
        icon: 'ri:refresh-line'
      }
    },
    {
      path: 'core-log',
      name: 'CoreLog',
      component: '/update/core-log',
      meta: {
        title: 'menus.update.coreLog',
        icon: 'ri:file-list-3-line'
      }
    }
  ]
}
