<template>
  <div v-if="resources?.length" class="section-block">
    <div class="section-header">
      <div class="section-title">{{ t('core.noteDetail.resources') }}</div>
      <div class="header-actions">
        <ElButton
          type="primary"
          size="small"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDedup"
        >
          {{ t('core.noteDetail.batchDedup') }}
        </ElButton>
        <ElButton size="small" class="ml-2" @click="openAddDialog">{{
          t('core.noteDetail.addResource')
        }}</ElButton>
      </div>
    </div>

    <ElTable
      ref="tableRef"
      :data="resources"
      size="small"
      style="width: 100%"
      @selection-change="onSelectionChange"
    >
      <ElTableColumn type="selection" width="48" />
      <ElTableColumn :label="t('core.noteDetail.image')" width="80">
        <template #default="{ row }">
          <ElImage
            :src="getNoteResourceImageUrl(row.id)"
            class="resource-image"
            fit="cover"
            :preview-src-list="[getNoteResourceImageUrl(row.id)]"
            preview-teleported
          />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="resource_type" :label="t('core.noteDetail.type')" width="70" />
      <ElTableColumn prop="format" :label="t('core.noteDetail.format')" width="70" />
      <ElTableColumn :label="t('core.noteDetail.dimensions')" width="100">
        <template #default="{ row }">
          {{ row.width && row.height ? `${row.width}x${row.height}` : '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="duration" :label="t('core.noteDetail.duration')" width="80" />
      <ElTableColumn :label="t('core.noteDetail.dedup')" width="80">
        <template #default="{ row }">
          <ElTag :type="row.is_deduplicated ? 'success' : 'info'">
            {{
              row.is_deduplicated
                ? t('core.noteDetail.deduplicated')
                : t('core.noteDetail.notDeduplicated')
            }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('core.noteDetail.action')" width="90">
        <template #default="{ row }">
          <ElButton
            type="primary"
            size="small"
            :disabled="row.is_deduplicated"
            @click="handleDedup(row)"
          >
            {{ t('core.noteDetail.dedup') }}
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- Add Resource Dialog -->
    <ElDialog
      v-model="addVisible"
      :title="t('core.noteDetail.addResource')"
      width="520px"
      append-to-body
    >
      <div class="upload-container">
        <ElUpload
          v-model:file-list="uploadList"
          :auto-upload="false"
          multiple
          :limit="50"
          drag
          accept="image/*,video/*"
          @change="onUploadChange"
        >
          <div class="upload-area">
            <div class="upload-text">{{ t('core.noteDetail.uploadText') }}</div>
            <div class="upload-tip">{{ t('core.noteDetail.uploadTip') }}</div>
            <div class="upload-btn"
              ><ElButton type="primary">{{ t('core.noteDetail.selectFile') }}</ElButton></div
            >
          </div>
        </ElUpload>
      </div>
      <template #footer>
        <ElButton @click="addVisible = false">{{ t('core.noteDetail.cancel') }}</ElButton>
        <ElButton type="primary" :loading="submitting" @click="confirmAdd">{{
          t('core.noteDetail.add')
        }}</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    ElButton,
    ElTable,
    ElTableColumn,
    ElMessage,
    ElUpload,
    ElTag,
    ElDialog,
    type UploadUserFile,
    type UploadFile
  } from 'element-plus'
  import {
    deduplicateResources,
    addResources,
    getNoteResourceImageUrl,
    type NoteResource
  } from '@/api/automation/note'

  const { t } = useI18n()

  const props = defineProps<{
    noteId?: string
    resources?: NoteResource[]
  }>()

  const emit = defineEmits<{
    (e: 'refresh'): void
  }>()

  // -- Deduplication --
  const selectedIds = ref<number[]>([])
  const tableRef = ref()

  const onSelectionChange = (rows: NoteResource[]) => {
    selectedIds.value = rows.map((r) => r.id).filter((id) => Number.isFinite(id))
  }

  const executeDedup = async (ids: number[]) => {
    if (!ids.length) return
    try {
      await deduplicateResources({
        resource_ids: ids,
        modification_ratio: 0.0001,
        video_frame_count: 10
      })
      ElMessage.success(t('core.noteDetail.operationSuccess'))
      emit('refresh')
      selectedIds.value = []
      tableRef.value?.clearSelection()
    } catch (e: any) {
      ElMessage.error(e?.message || t('core.noteDetail.operationError'))
    }
  }

  const handleDedup = (row: NoteResource) => executeDedup([row.id])
  const handleBatchDedup = () => executeDedup(selectedIds.value)

  // -- Add Resource --
  const addVisible = ref(false)
  const uploadList = ref<UploadUserFile[]>([])
  const submitting = ref(false)

  const openAddDialog = () => {
    addVisible.value = true
    uploadList.value = []
  }

  const onUploadChange = (_file: UploadFile, fileList: UploadUserFile[]) => {
    uploadList.value = fileList
  }

  const confirmAdd = async () => {
    const files = uploadList.value
      .map((f) => f.raw)
      .filter((f) => !!f && f instanceof File) as File[]

    if (files.length === 0 || !props.noteId) {
      ElMessage.warning(t('core.noteDetail.selectFileWarning'))
      return
    }

    submitting.value = true
    try {
      await addResources(props.noteId, files)
      ElMessage.success(t('core.noteDetail.addSuccess'))
      addVisible.value = false
      emit('refresh')
    } catch (e: any) {
      ElMessage.error(e?.message || t('core.noteDetail.addError'))
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  .section-block {
    margin-top: 16px;

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .section-title {
      font-weight: 600;
      color: var(--art-text-gray-800);
      margin-bottom: 8px;
    }

    .section-actions {
      margin-top: 8px;
      text-align: right;
    }
  }

  .resource-image {
    width: 60px;
    height: 60px;
    border-radius: 6px;
  }

  .upload-container {
    .upload-area {
      padding: 24px;
      text-align: center;
      color: var(--art-text-gray-700);

      .upload-text {
        font-weight: 600;
        margin-bottom: 6px;
      }

      .upload-tip {
        font-size: 12px;
        color: var(--art-text-gray-500);
      }

      .upload-btn {
        margin-top: 12px;
      }
    }
  }

  .ml-2 {
    margin-left: 8px;
  }
</style>
