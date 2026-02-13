<template>
  <div class="update-test-container">
    <!-- 更新管理标签页 -->
    <ElTabs v-model="activeTab" type="border-card">
      <!-- 核心更新标签页 -->
      <ElTabPane :label="t('update.tabs.core')" name="core">
        <template #label>
          <ElSpace direction="horizontal" alignment="center" :size="6">
            <ElIcon><Setting /></ElIcon>
            <span>{{ t('update.tabs.core') }}</span>
          </ElSpace>
        </template>

        <CoreUpdate :on-log="addLog" />
      </ElTabPane>

      <!-- 应用更新标签页 -->
      <ElTabPane :label="t('update.tabs.app')" name="app">
        <template #label>
          <ElSpace direction="horizontal" alignment="center" :size="6">
            <ElIcon><Monitor /></ElIcon>
            <span>{{ t('update.tabs.app') }}</span>
          </ElSpace>
        </template>

        <AppUpdate :on-log="addLog" />
      </ElTabPane>
    </ElTabs>

    <!-- 操作日志 -->
    <ElCard shadow="hover">
      <template #header>
        <ElSpace
          direction="horizontal"
          alignment="center"
          justify="space-between"
          style="width: 100%"
        >
          <ElSpace direction="horizontal" alignment="center" :size="8">
            <ElIcon><List /></ElIcon>
            <span>{{ t('update.log.title') }}</span>
          </ElSpace>
          <ElButton @click="clearLogs" size="small" type="danger" :icon="Delete" plain>
            {{ t('update.log.clear') }}
          </ElButton>
        </ElSpace>
      </template>
      <div style="height: 300px; overflow-y: auto; padding: 8px">
        <ElSpace
          v-if="logs.length > 0"
          direction="vertical"
          alignment="start"
          :size="8"
          style="width: 100%"
        >
          <ElSpace
            v-for="(log, index) in logs"
            :key="index"
            direction="horizontal"
            alignment="center"
            :size="8"
            style="width: 100%"
          >
            <ElTag :type="getLogTagType(log.type)" size="small" style="flex-shrink: 0">
              {{ getLogTypeText(log.type) }}
            </ElTag>
            <span style="flex-shrink: 0; color: #909399; font-size: 12px">{{
              formatTime(log.timestamp)
            }}</span>
            <span style="flex: 1; word-break: break-all">{{ log.message }}</span>
          </ElSpace>
        </ElSpace>
        <div
          v-else
          style="display: flex; align-items: center; justify-content: center; height: 100%"
        >
          <ElEmpty :description="t('update.log.empty')" :image-size="80" />
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { List, Delete, Monitor, Setting } from '@element-plus/icons-vue'
  import CoreUpdate from './core-update.vue'
  import AppUpdate from './app-update.vue'
  import { useLogManager } from '@/composables/useUpdateManager'

  const { t } = useI18n()

  // 类型定义
  // 响应式数据
  const activeTab = ref<string>('core')

  // 使用日志管理器
  const { logs, addLog, clearLogs } = useLogManager()

  // 工具函数
  const getLogTagType = (type: string) => {
    switch (type) {
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'danger'
      default:
        return 'info'
    }
  }

  const getLogTypeText = (type: string) => {
    switch (type) {
      case 'success':
        return t('update.log.success')
      case 'warning':
        return t('update.log.warning')
      case 'error':
        return t('update.log.error')
      default:
        return t('update.log.info')
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  // 生命周期
  onMounted(() => {
    addLog(t('update.log.loaded'), 'info')
  })
</script>
