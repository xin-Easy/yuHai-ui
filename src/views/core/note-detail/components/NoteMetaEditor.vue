<template>
  <div class="note-meta-editor">
    <div class="section-block">
      <div class="section-title">{{ t('core.noteDetail.description') }}</div>
      <ElInput
        v-model="descEdit"
        type="textarea"
        :rows="4"
        :placeholder="t('core.noteDetail.descPlaceholder')"
      />
      <div class="section-actions">
        <ElButton type="primary" size="small" @click="saveDesc">{{
          t('core.noteDetail.saveDesc')
        }}</ElButton>
      </div>
    </div>

    <div class="section-block">
      <div class="section-title">{{ t('core.noteDetail.tags') }}</div>
      <div class="tag-list">
        <ElTag v-for="(t, i) in tagsEdit" :key="i" closable @close="removeTag(i)">
          {{ t }}
        </ElTag>
        <ElInput
          v-model="newTag"
          :placeholder="t('core.noteDetail.tagPlaceholder')"
          size="small"
          class="tag-input"
          @keyup.enter="addTag"
        />
      </div>
      <div class="section-actions">
        <ElButton type="primary" size="small" @click="saveTags">{{
          t('core.noteDetail.saveTags')
        }}</ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElInput, ElButton, ElTag, ElMessage } from 'element-plus'

  const { t } = useI18n()

  const props = defineProps<{
    description?: string
    tags?: any[]
  }>()

  const emit = defineEmits<{
    (e: 'update:description', val: string): void
    (e: 'update:tags', val: string[]): void
  }>()

  const descEdit = ref('')
  const tagsEdit = ref<string[]>([])
  const newTag = ref('')

  watch(
    () => props.description,
    (val) => {
      descEdit.value = val || ''
    },
    { immediate: true }
  )

  watch(
    () => props.tags,
    (val) => {
      if (Array.isArray(val)) {
        tagsEdit.value = val.map((t: any) => (typeof t === 'string' ? t : t?.name || t?.tag || ''))
      } else {
        tagsEdit.value = []
      }
    },
    { immediate: true }
  )

  const saveDesc = () => {
    emit('update:description', descEdit.value)
    ElMessage.success(t('core.noteDetail.descUpdated'))
  }

  const addTag = () => {
    const v = newTag.value.trim()
    if (!v) return
    tagsEdit.value.push(v)
    newTag.value = ''
  }

  const removeTag = (index: number) => {
    tagsEdit.value.splice(index, 1)
  }

  const saveTags = () => {
    emit('update:tags', [...tagsEdit.value])
    ElMessage.success(t('core.noteDetail.tagsUpdated'))
  }
</script>

<style scoped lang="scss">
  .section-block {
    margin-top: 16px;

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

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .tag-input {
      max-width: 180px;
    }
  }
</style>
