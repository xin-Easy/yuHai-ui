<template>
  <div class="update-panel">
    <ElCard shadow="hover">
      <template #header>
        <ElSpace direction="horizontal" alignment="center" :size="8">
          <ElIcon><Operation /></ElIcon>
          <span>{{ t('update.panel.control', { label }) }}</span>
        </ElSpace>
      </template>
      <ElSpace direction="horizontal" alignment="center" :size="12" wrap>
        <ElButton
          type="primary"
          @click="onCheck"
          :loading="state.checking"
          :icon="Search"
          size="default"
        >
          {{ state.checking ? t('update.panel.checking') : t('update.panel.check', { label }) }}
        </ElButton>

        <ElButton
          v-if="onDownload"
          type="success"
          @click="onDownload"
          :disabled="!state.available || state.downloading"
          :loading="state.downloading"
          :icon="Download"
          size="default"
        >
          {{
            state.downloading
              ? t('update.panel.downloading')
              : t('update.panel.download', { label })
          }}
        </ElButton>

        <ElButton
          v-if="onInstall"
          type="warning"
          @click="onInstall"
          :disabled="!state.downloaded"
          :icon="Upload"
          size="default"
        >
          {{ t('update.panel.install', { label }) }}
        </ElButton>

        <ElButton
          v-if="onCancel"
          type="danger"
          @click="onCancel"
          :disabled="!state.downloading"
          :icon="RefreshLeft"
          size="default"
        >
          {{ t('update.panel.cancelDownload') }}
        </ElButton>
      </ElSpace>
    </ElCard>

    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="24" :md="showProgress ? 12 : 24" :lg="showProgress ? 12 : 24" :xl="showProgress ? 12 : 24">
        <ElCard shadow="hover">
          <template #header>
            <ElSpace direction="horizontal" alignment="center" :size="8">
              <ElIcon><InfoFilled /></ElIcon>
              <span>{{ t('update.panel.status', { label }) }}</span>
            </ElSpace>
          </template>
          <div>
            <ElSpace direction="vertical" alignment="start" :size="12">
              <ElSpace
                v-if="state.currentVersion"
                direction="horizontal"
                alignment="center"
                :size="8"
              >
                <span style="min-width: 80px">{{ t('update.panel.currentVersion') }}</span>
                <ElTag type="info" size="small">{{ state.currentVersion }}</ElTag>
              </ElSpace>

              <ElSpace direction="horizontal" alignment="center" :size="8">
                <span style="min-width: 80px">{{ t('update.panel.updateStatus') }}</span>
                <ElTag :type="statusType" :effect="statusEffect">{{ statusText }}</ElTag>
              </ElSpace>

              <div v-if="showLatestInfo && state.updateInfo">
                <ElDivider content-position="left">
                  <span>{{ t('update.panel.latestInfo') }}</span>
                </ElDivider>

                <ElSpace direction="vertical" alignment="start" :size="12">
                  <ElSpace direction="horizontal" alignment="center" :size="8">
                    <span style="min-width: 80px">{{ t('update.panel.latestVersion') }}</span>
                    <ElTag type="success" size="small">{{ state.updateInfo.version }}</ElTag>
                  </ElSpace>

                  <ElSpace direction="horizontal" alignment="center" :size="8">
                    <span style="min-width: 80px">{{ t('update.panel.releaseDate') }}</span>
                    <span>{{ formatDate(state.updateInfo.releaseDate) }}</span>
                  </ElSpace>

                  <ElSpace direction="horizontal" alignment="center" :size="8">
                    <span style="min-width: 80px">{{ t('update.panel.fileSize') }}</span>
                    <ElTag type="info" size="small">{{ formatBytes(state.updateInfo.size) }}</ElTag>
                  </ElSpace>
                </ElSpace>
              </div>

              <ElAlert
                v-if="state.error"
                :title="state.error"
                type="error"
                :closable="false"
                show-icon
              />
            </ElSpace>
          </div>
        </ElCard>
      </ElCol>

      <ElCol v-if="showProgress" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <ElCard shadow="hover" v-if="state.progress">
          <template #header>
            <ElSpace direction="horizontal" alignment="center" :size="8">
              <ElIcon><Download /></ElIcon>
              <span>{{ t('update.panel.downloadProgress') }}</span>
            </ElSpace>
          </template>
          <div>
            <ElProgress
              :percentage="state.progress.percentage"
              :stroke-width="12"
              :show-text="false"
              status="success"
            />
            <ElSpace direction="vertical" alignment="center" :size="8">
              <ElSpace direction="horizontal" alignment="center" justify="space-between">
                <span>{{ state.progress.percentage.toFixed(1) }}%</span>
                <span>{{ formatBytes(state.progress.speed) }}/s</span>
              </ElSpace>
              <ElSpace direction="horizontal" alignment="center">
                {{ formatBytes(state.progress.transferred) }} /
                {{ formatBytes(state.progress.total) }}
              </ElSpace>
            </ElSpace>
          </div>
        </ElCard>
        <ElCard shadow="hover" v-else>
          <template #header>
            <ElSpace direction="horizontal" alignment="center" :size="8">
              <ElIcon><Download /></ElIcon>
              <span>{{ t('update.panel.downloadProgress') }}</span>
            </ElSpace>
          </template>
          <div>
            <ElEmpty :description="t('update.panel.noDownloadTask')" :image-size="80" />
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElCard shadow="hover" v-if="showDescription && state.updateInfo?.description">
      <template #header>
        <ElSpace direction="horizontal" alignment="center" :size="8">
          <ElIcon><EditPen /></ElIcon>
          <span>{{ t('update.panel.description') }}</span>
        </ElSpace>
      </template>
      <div>
        <ElAlert :title="state.updateInfo.description" type="info" :closable="false" show-icon />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    ElCard,
    ElSpace,
    ElIcon,
    ElButton,
    ElRow,
    ElCol,
    ElTag,
    ElDivider,
    ElAlert,
    ElProgress,
    ElEmpty
  } from 'element-plus'
  import {
    Operation,
    Search,
    Download,
    Upload,
    RefreshLeft,
    InfoFilled,
    EditPen
  } from '@element-plus/icons-vue'
  import {
    formatBytes,
    formatDate,
    getStatusTagType,
    getStatusEffect,
    getStatusText,
    type TagType,
    type TagEffect
  } from '@/utils/update'

  const { t } = useI18n()

  interface UpdateInfoLite {
    version: string
    size: number
    releaseDate: string | number
    description?: string
  }

  interface ProgressLite {
    percentage: number
    transferred: number
    total: number
    speed: number
  }

  interface UpdateStateLite {
    checking: boolean
    downloading: boolean
    downloaded: boolean
    available: boolean
    error: string | null
    currentVersion?: string
    updateInfo?: UpdateInfoLite
    progress?: ProgressLite
  }

  interface Props {
    label: string
    state: UpdateStateLite
    onCheck: () => any
    onDownload?: () => any
    onInstall?: () => any
    onCancel?: () => any
    showDescription?: boolean
    showProgress?: boolean
    showLatestInfo?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showDescription: true,
    showProgress: true,
    showLatestInfo: true
  })

  const statusType = computed<TagType>(() =>
    getStatusTagType({
      checking: props.state.checking,
      error: props.state.error ?? undefined,
      downloaded: props.state.downloaded,
      downloading: props.state.downloading,
      available: props.state.available
    })
  )

  const statusEffect = computed<TagEffect>(() =>
    getStatusEffect({
      checking: props.state.checking,
      downloading: props.state.downloading
    })
  )

  const statusText = computed<string>(() =>
    getStatusText({
      checking: props.state.checking,
      error: props.state.error ?? undefined,
      downloaded: props.state.downloaded,
      downloading: props.state.downloading,
      available: props.state.available
    })
  )
</script>

<style scoped lang="scss">
  .update-panel {
    .el-card {
      margin-bottom: 20px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .el-progress {
      margin-bottom: 12px;
    }
  }
</style>
