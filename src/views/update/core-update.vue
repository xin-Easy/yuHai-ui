<template>
  <UpdatePanel
    :label="t('update.core')"
    :state="coreState"
    :on-check="checkForUpdates"
    :show-description="false"
    :show-progress="false"
    :show-latest-info="false"
  />

  <ElDialog
    v-model="updateDialogVisible"
    width="720px"
    destroy-on-close
    :close-on-click-modal="false"
    :title="t('update.check.found') + (coreState.updateInfo?.version || '')"
  >
    <ElScrollbar max-height="420px">
      <ElDescriptions v-if="coreState.updateInfo" :column="2" border>
        <ElDescriptionsItem :label="t('update.panel.latestVersion')">
          {{ coreState.updateInfo.version }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="t('update.panel.releaseDate')">
          {{ formatDate(coreState.updateInfo.releaseDate) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="t('update.panel.fileSize')">
          {{ formatBytes(coreState.updateInfo.size) }}
        </ElDescriptionsItem>
      </ElDescriptions>
      <div v-if="updateMarkdownHtml" class="update-md" v-html="updateMarkdownHtml" />
    </ElScrollbar>
    <template #footer>
      <div class="flex justify-end gap-3">
        <ElButton @click="handleUpdateCancel">{{ t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleUpdateConfirm">{{ t('update.install.action') }}</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { invoke } from '@tauri-apps/api/core'
  import { marked } from 'marked'
  import { computed, ref } from 'vue'
  import { ElDialog, ElScrollbar, ElDescriptions, ElDescriptionsItem, ElButton } from 'element-plus'

  import {
    useUpdateManager,
    useUpdateOperations,
    type BaseUpdateState
  } from '@/composables/useUpdateManager'
  import { formatBytes, formatDate } from '@utils/update'
  import UpdatePanel from '@/components/update/UpdatePanel.vue'

  // 核心更新状态接口
  interface CoreUpdateState extends BaseUpdateState {
    updateInfo?: {
      version: string
      size: number
      releaseDate: string | number
      description?: string
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

  // 核心更新状态
  const coreState = createUpdateState<CoreUpdateState>({
    checking: false,
    downloading: false,
    downloaded: false,
    available: false,
    error: null,
    currentVersion: undefined,
    updateInfo: undefined
  })

  const updateDialogVisible = ref(false)
  const coreApiTimeout = Number(import.meta.env.VITE_CORE_UPDATE_API_TIMEOUT) || 5000
  const coreApiPollInterval = Number(import.meta.env.VITE_CORE_UPDATE_API_POLL_INTERVAL) || 100
  const updateMarkdownHtml = computed(() => {
    const content = coreState.updateInfo?.description || ''
    return content ? marked(content) : ''
  })

  // 获取核心更新API
  const getCoreApi = () => {
    // Tauri implementation
    if (window.__TAURI_INTERNALS__) {
      return {
        checkForUpdates: () => invoke('core_update_check'),
        installUpdate: () => invoke('core_update_install'),
        getCurrentVersion: () => invoke('core_update_get_version')
      }
    }
    return null
  }

  // 等待核心更新API就绪
  const waitForApi = async (timeout = coreApiTimeout): Promise<ReturnType<typeof getCoreApi> | null> => {
    const start = Date.now()
    let api = getCoreApi()
    while (!api && Date.now() - start < timeout) {
      await new Promise((r) => setTimeout(r, coreApiPollInterval))
      api = getCoreApi()
    }
    return api
  }

  // 核心更新相关方法
  const checkForUpdates = async () => {
    await executeUpdateOperation(
      async () => {
        const api = await waitForApi()
        if (!api) {
          props.onLog(t('update.env.browser'), 'info')
          props.onLog(t('update.env.coreDesktopRequired'), 'warning')
          coreState.available = false
          coreState.updateInfo = {
            version: t('update.env.coreWebEnvironment'),
            size: 0,
            releaseDate: new Date().toISOString(),
            description: t('update.env.coreDesktopRequiredDesc')
          }
          return { hasUpdate: false, updateInfo: coreState.updateInfo }
        }

        // Pass server URL if using Tauri
        // For Tauri, we pass the URL.
        let result: any
        if (window.__TAURI_INTERNALS__) {
          result = await api.checkForUpdates()
        } else {
          result = await api.checkForUpdates()
        }

        if (result.updateInfo) {
          coreState.available = !!result.hasUpdate
          coreState.updateInfo = {
            version: result.updateInfo.version,
            size: result.updateInfo.fileSize ?? 0,
            releaseDate:
              result.updateInfo.pubDate ||
              result.updateInfo.releaseDate ||
              result.updateInfo.buildTimestamp,
            description: result.updateInfo.releaseNotes || result.updateInfo.description
          }
          if (result.hasUpdate) {
            props.onLog(`${t('update.check.found')}${coreState.updateInfo.version}`, 'success')
            updateDialogVisible.value = true
          }

          if (coreState.updateInfo.size > 0) {
            props.onLog(`${t('update.check.size')}${formatBytes(coreState.updateInfo.size)}`, 'info')
          }
          if (coreState.updateInfo.releaseDate) {
            props.onLog(
              `${t('update.check.date')}${formatDate(coreState.updateInfo.releaseDate)}`,
              'info'
            )
          }
        }

        if (!result.hasUpdate) {
          coreState.available = false
          props.onLog(t('update.check.latest'), 'success')
        }

        return result
      },
      coreState,
      'checking',
      t('update.check.coreStart'),
      t('update.check.coreComplete'),
      t('update.check.coreAction')
    )
  }

  const installUpdate = async () => {
    try {
      props.onLog(t('update.install.coreStart'), 'info')

      const api = await waitForApi()
      if (!api) {
        props.onLog(t('update.install.coreApiUnavailable'), 'warning')
        return
      }
      await api.installUpdate()
      props.onLog(t('update.install.coreComplete'), 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('update.install.coreFailed')
      coreState.error = errorMessage
      props.onLog(`${t('update.install.coreFailed')}: ${errorMessage}`, 'error')
    }
  }

  const handleUpdateConfirm = async () => {
    updateDialogVisible.value = false
    await installUpdate()
  }

  const handleUpdateCancel = () => {
    updateDialogVisible.value = false
  }

  onMounted(async () => {
    props.onLog(t('update.init.coreComplete'), 'info')

    // 获取当前核心版本
    try {
      // 等待API可用
      const api = await waitForApi()
      if (api) {
        try {
          const version: any = await api.getCurrentVersion()
          coreState.currentVersion = version
          props.onLog(`${t('update.version.coreCurrent')}${version}`, 'info')
        } catch (e) {
          props.onLog(`${t('update.version.coreFailed')}: ${e}`, 'error')
        }
      } else {
        props.onLog(t('update.init.apiTimeout'), 'warning')
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      props.onLog(t('update.version.coreFailed'), 'error')
    }

  })
</script>
