<template>
  <ElDialog
    v-model="visible"
    :title="t('core.noteManage.collectDialog.title')"
    width="500px"
    destroy-on-close
  >
    <ElForm ref="formRef" :model="form" label-width="100px">
      <ElFormItem :label="t('core.noteManage.collectDialog.keywords')" prop="keywords" required>
        <ElInput v-model="form.keywords" placeholder="请输入搜索关键词" />
      </ElFormItem>

      <ElFormItem :label="t('core.noteManage.collectDialog.filterKeywords')" prop="filter_keywords">
        <ElInput v-model="form.filter_keywords" placeholder="请输入过滤关键词，多个用逗号分隔" />
      </ElFormItem>
      
      <ElFormItem :label="t('core.noteManage.collectDialog.count')" prop="collect_count">
        <ElInputNumber v-model="form.collect_count" :min="1" :max="1000" />
      </ElFormItem>

      <div class="filter-section">
        <div class="section-title">{{ t('core.noteManage.collectDialog.conditions') }}</div>
        <ElFormItem :label="t('core.noteManage.collectDialog.liked')" prop="liked_count_big_than">
          <ElInputNumber v-model="form.liked_count_big_than" :min="0" />
        </ElFormItem>
        <ElFormItem :label="t('core.noteManage.collectDialog.collected')" prop="collected_count_big_than">
          <ElInputNumber v-model="form.collected_count_big_than" :min="0" />
        </ElFormItem>
        <ElFormItem :label="t('core.noteManage.collectDialog.comment')" prop="comment_count_big_than">
          <ElInputNumber v-model="form.comment_count_big_than" :min="0" />
        </ElFormItem>
      </div>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">
        {{ t('common.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { collectNotes } from '@/api/automation/note'
import { mittBus } from '@/utils/sys'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18n()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const loading = ref(false)
const form = reactive({
  keywords: '',
  filter_keywords: '',
  collect_count: 50,
  liked_count_big_than: 0,
  collected_count_big_than: 0,
  comment_count_big_than: 0,
  shared_count_big_than: 0
})

const handleSubmit = async () => {
  if (!form.keywords) {
    ElMessage.warning('请输入关键词')
    return
  }

  loading.value = true
  try {
    const payload = {
      ...form,
      filter_keywords: form.filter_keywords ? form.filter_keywords.split(/[,，]/).map(s => s.trim()).filter(Boolean) : []
    }
    const res = await collectNotes(payload)
    ElMessage.success(`采集成功: ${res.collected_count} 条笔记`)
    mittBus.emit('refresh-stats')
    visible.value = false
    emit('success')
  } catch (e: any) {
    ElMessage.error(e.message || '采集失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.filter-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--art-border-color);
  
  .section-title {
    margin-bottom: 12px;
    font-weight: 500;
    color: var(--art-text-gray-700);
  }
}
</style>