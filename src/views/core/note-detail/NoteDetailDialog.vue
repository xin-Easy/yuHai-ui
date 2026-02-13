<template>
  <ElDialog
    v-model="internalVisible"
    :title="t('core.noteDetail.title')"
    width="60%"
    destroy-on-close
  >
    <div class="note-detail-dialog">
      <ElDescriptions :column="3" border size="small">
        <ElDescriptionsItem :label="t('core.noteDetail.type')">{{
          detail.note_type || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('core.commentManage.noteId')">{{
          detail.note_id || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('core.noteDetail.userId')">{{
          detail.user_id || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('core.noteDetail.likedCount')">{{
          detail.liked_count || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('core.noteDetail.collectedCount')">{{
          detail.collected_count || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('core.noteDetail.commentCount')">{{
          detail.comment_count || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('core.noteDetail.shareCount')">{{
          detail.share_count || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('core.noteDetail.publishTime')">{{
          detail.publish_time || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('core.noteDetail.createdAt')">{{
          detail.created_at || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('core.noteDetail.coverSize')">
          {{
            detail.cover_width && detail.cover_height
              ? `${detail.cover_width}x${detail.cover_height}`
              : '-'
          }}
        </ElDescriptionsItem>
      </ElDescriptions>

      <NoteMetaEditor
        :description="detail.description"
        :tags="detail.tag_list"
        @update:description="updateDescription"
        @update:tags="updateTags"
      />

      <NoteResourcePanel
        :note-id="detail.note_id"
        :resources="detail.resources"
        @refresh="refreshDetail"
      />
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElDialog, ElDescriptions, ElDescriptionsItem } from 'element-plus'
  import { getNoteDetailInfo, type NoteDetail } from '@/api/automation/note'
  import NoteResourcePanel from './components/NoteResourcePanel.vue'
  import NoteMetaEditor from './components/NoteMetaEditor.vue'

  const { t } = useI18n()

  const props = defineProps<{
    visible: boolean
    data: Partial<NoteDetail>
  }>()

  const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void
    (e: 'update:data', data: Partial<NoteDetail>): void
  }>()

  // -- Visibility Control --
  const internalVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  // -- Data Management --
  const detail = ref<Partial<NoteDetail>>({})

  watch(
    () => props.data,
    (newVal) => {
      detail.value = newVal || {}
    },
    { immediate: true, deep: true }
  )

  const updateDescription = (desc: string) => {
    detail.value.description = desc
    emit('update:data', detail.value)
  }

  const updateTags = (tags: string[]) => {
    detail.value.tag_list = tags
    emit('update:data', detail.value)
  }

  const refreshDetail = async () => {
    if (!detail.value.note_id) return
    try {
      const fresh = await getNoteDetailInfo(detail.value.note_id)
      if (fresh) {
        detail.value = fresh
        emit('update:data', detail.value)
      }
    } catch (e) {
      console.error('Failed to refresh detail', e)
    }
  }
</script>

<style scoped lang="scss">
  .note-detail-dialog {
    padding: 8px 12px;
  }
</style>
