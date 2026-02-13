import type { App } from 'vue'
import { setupRippleDirective } from './business/ripple'

export function setupGlobDirectives(app: App) {
  setupRippleDirective(app) // 水波纹指令
}
