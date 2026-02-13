/// <reference types="vite/client" />

declare module 'nprogress'

// 全局变量声明
declare const __APP_VERSION__: string // 版本号

interface Window {
  // Tauri globals are already typed by @tauri-apps/api, but we can add specific app globals if needed
  __TAURI_INTERNALS__?: any
}
