/**
 * 统一进度条管理器
 *
 * 提供全局路由进度条管理，避免重复导入和配置
 *
 * @module utils/progress
 */
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  easing: 'ease',
  speed: 600,
  showSpinner: false,
  parent: 'body'
})

export const progress = {
  start: () => NProgress.start(),
  done: () => NProgress.done(),
  inc: () => NProgress.inc(),
  set: (percent: number) => NProgress.set(percent),
  configure: (options: Parameters<typeof NProgress.configure>[0]) => NProgress.configure(options)
}

export default progress
