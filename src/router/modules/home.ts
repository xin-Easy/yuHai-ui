import { AppRouteRecord } from '@/types/router'

export const homeRoutes: AppRouteRecord = {
  path: '/home',
  name: 'Home',
  component: '/index/index',
  meta: {
    title: 'menus.home.title',
    icon: 'ri:home-smile-2-line',
    order: 1,
    single: true
  },
  children: [
    {
      path: '',
      name: 'HomePage',
      component: '/home/index',
      meta: {
        title: 'menus.home.title',
        icon: 'ri:home-smile-2-line',
        keepAlive: false,
        fixedTab: true
      }
    }
  ]
}
