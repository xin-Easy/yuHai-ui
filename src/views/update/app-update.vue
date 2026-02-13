<template>
  <UpdatePanel
    :label="t('update.app')"
    :state="appState"
    :on-check="checkAppUpdates"
    :on-download="downloadAppUpdate"
    :on-install="installAppUpdate"
    :on-cancel="cancelAppDownload"
    :show-description="false"
  />
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    useUpdateManager,
    useUpdateOperations,
    type BaseUpdateState
  } from '@/composables/useUpdateManager'
  import { getStatusTagType, getStatusEffect, getStatusText } from '@/utils/update'
  import UpdatePanel from '@/components/update/UpdatePanel.vue'

  // 应用更新状态接口
  interface AppUpdateState extends BaseUpdateState {
    updateInfo?: {
      version: string
      size: number
      releaseDate: string
      description?: string
    }
    progress?: {
      percentage: number
      transferred: number
      total: number
      speed: number
    }
  }

  // Props
  interface Props {
    onLog?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
  }

  const props = withDefaults(defineProps<Props>(), {
    onLog: () => {}
  })

  const { t } = useI18n()

  // 使用更新管理器
  const { createUpdateState } = useUpdateManager()
  const { executeUpdateOperation } = useUpdateOperations(props.onLog)

  // 应用更新状态
  const appState = createUpdateState<AppUpdateState>({
    checking: false,
    downloading: false,
    downloaded: false,
    available: false,
    error: null,
    currentVersion: undefined,
    updateInfo: undefined,
    progress: undefined
  })

  // 检查是否在Tauri环境中
  const isTauri = !!window.__TAURI_INTERNALS__

  // 应用更新相关方法
  const checkAppUpdates = async () => {
    const result = await executeUpdateOperation(
      async () => {
        if (!isTauri) {
          // 浏览器环境下的处理逻辑
          props.onLog(t('update.env.browser'), 'info')
          props.onLog(t('update.env.browserAutoUpdate'), 'info')
          props.onLog(t('update.env.desktopRequired'), 'warning')

          // 模拟检查完成状态
          appState.available = false
          appState.updateInfo = {
            version: t('update.env.webVersion'),
            size: 0,
            releaseDate: new Date().toISOString(),
            description: t('update.env.webAutoUpdate')
          }

          return { hasUpdate: false, updateInfo: appState.updateInfo }
        }

        const { check } = await import('@tauri-apps/plugin-updater')
        const update = await check()

        if (update) {
          appState.available = true
          appState.updateInfo = {
            version: update.version,
            size: 0, // Tauri v2 update object doesn't expose size directly in check result easily
            releaseDate: update.date || new Date().toISOString(),
            description: update.body || t('update.check.found')
          }
          return { hasUpdate: true, updateInfo: appState.updateInfo, rawUpdate: update }
        } else {
          appState.available = false
          return { hasUpdate: false }
        }
      },
      appState,
      'checking',
      t('update.check.start'),
      t('update.check.complete'),
      t('update.check.action')
    )

    if (result && !result.hasUpdate && isTauri) {
      props.onLog(t('update.check.latest'), 'success')
    }
  }

  const downloadAppUpdate = async () => {
    // Tauri updater integrates download and install
    // Just trigger the install flow which handles both
    await installAppUpdate()
  }

  const installAppUpdate = async () => {
    if (!isTauri) return

    await executeUpdateOperation(
      async () => {
        const { check } = await import('@tauri-apps/plugin-updater')
        // Re-check to get the update object
        // In a perfect world we'd cache the update object from checkAppUpdates
        // but for now re-checking is safe and robust enough
        const update = await check()

        if (!update) {
          props.onLog(t('update.check.notFound'), 'warning')
          return { success: false }
        }

        let downloaded = 0
        let contentLength = 0
        let startTime = Date.now()

        await update.downloadAndInstall((event) => {
          if (event.event === 'Started') {
            contentLength = event.data.contentLength || 0
            props.onLog(`${t('update.download.start')}${contentLength}`, 'info')
            startTime = Date.now()
          } else if (event.event === 'Progress') {
            downloaded += event.data.chunkLength
            if (contentLength > 0) {
              const now = Date.now()
              const elapsed = (now - startTime) / 1000 // seconds
              const speed = elapsed > 0 ? downloaded / elapsed : 0

              const progress = {
                percentage: (downloaded / contentLength) * 100,
                transferred: downloaded,
                total: contentLength,
                speed: speed
              }
              appState.progress = progress
            }
          } else if (event.event === 'Finished') {
            props.onLog(t('update.download.complete'), 'success')
          }
        })

        const { relaunch } = await import('@tauri-apps/plugin-process')
        await relaunch()

        return { success: true }
      },
      appState,
      'downloading', // reuse downloading state for the whole process
      t('update.install.start'),
      t('update.install.complete'),
      t('update.install.action')
    )
  }

  const cancelAppDownload = async () => {
    // Tauri updater cancellation is not straightforward in the high-level API
    props.onLog(t('update.download.cancelUnsupported'), 'warning')
  }

  // 组件挂载时初始化
  onMounted(async () => {
    props.onLog(t('update.init.complete'), 'info')

    try {
      if (isTauri) {
        const { getVersion } = await import('@tauri-apps/api/app')
        const version = await getVersion()
        appState.currentVersion = version
        props.onLog(`${t('update.version.current')}${appState.currentVersion}`, 'info')
      } else {
        const buildTime = new Date().toLocaleDateString()
        appState.currentVersion = `${t('update.env.webVersion')} (${buildTime})`
        props.onLog(t('update.env.currentBrowser'), 'info')
        props.onLog(t('update.env.webAutoUpdate'), 'info')
        props.onLog(t('update.env.desktopRequired'), 'warning')
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      props.onLog(t('update.version.failed'), 'error')
    }
  })
</script>

<style scoped lang="scss"></style>
