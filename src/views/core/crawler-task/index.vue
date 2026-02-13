<template>
  <div class="crawler-task p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-medium">{{ t('core.crawlerTask.createTask') }}</span>
        </div>
      </template>

      <!-- Task Status Monitor -->
      <div v-if="currentTaskId" class="mb-6">
        <TaskStatusMonitor :task-id="currentTaskId" />
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane :label="t('core.crawlerTask.commentCollection')" name="comment">
          <el-form
            :model="formData"
            ref="formRef"
            :rules="rules"
            label-width="120px"
            class="max-w-2xl mt-4"
          >
            <el-form-item :label="t('core.crawlerTask.noteUrl')" prop="note_url">
              <el-input
                v-model="formData.note_url"
                :placeholder="t('core.crawlerTask.noteUrlPlaceholder')"
              />
            </el-form-item>

            <el-form-item :label="t('core.crawlerTask.maxCount')" prop="max_count">
              <el-input-number v-model="formData.max_count" :min="1" :max="10000" :step="100" />
            </el-form-item>

            <el-form-item :label="t('core.crawlerTask.maxDuration')" prop="max_duration">
              <el-input-number
                v-model="formData.max_duration"
                :min="0"
                :step="60"
                :placeholder="t('core.crawlerTask.unlimited')"
              />
            </el-form-item>

            <el-form-item
              :label="t('core.crawlerTask.maxConsecutiveFailures')"
              prop="max_consecutive_failures"
            >
              <el-input-number v-model="formData.max_consecutive_failures" :min="0" :max="50" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleSubmit">{{
                t('core.crawlerTask.submit')
              }}</el-button>
              <el-button @click="resetForm">{{ t('core.crawlerTask.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <!-- 可以扩展其他类型的爬虫任务 -->
      </el-tabs>
    </el-card>

    <TipsPanel class="mt-4" title="爬虫任务提示">
      <ul>
        <li>创建新的爬虫任务来采集数据，如评论采集。</li>
        <li>设置最大数量和时长限制以控制任务规模。</li>
        <li>任务状态栏实时显示当前运行任务的进度。</li>
      </ul>
    </TipsPanel>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage, type FormInstance } from 'element-plus'
  import { createCommentTask } from '@/api/automation/task'
  import TaskStatusMonitor from '@/components/TaskStatusMonitor.vue'
  import TipsPanel from '@/components/core/widget/tips-panel/index.vue'

  defineOptions({ name: 'CrawlerTask' })

  const { t } = useI18n()
  const activeTab = ref('comment')
  const loading = ref(false)
  const formRef = ref<FormInstance>()
  const currentTaskId = ref('')

  const formData = reactive({
    note_url: '',
    max_count: 100,
    max_duration: 0,
    max_consecutive_failures: 3
  })

  const rules = computed(() => ({
    note_url: [{ required: true, message: t('core.crawlerTask.noteUrlPlaceholder'), trigger: 'blur' }]
  }))

  const extractNoteId = (url: string): string => {
    try {
      const match =
        url.match(/\/explore\/([a-zA-Z0-9]+)/) || url.match(/\/discovery\/item\/([a-zA-Z0-9]+)/)
      return match ? match[1] : ''
    } catch (e) {
      return ''
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        loading.value = true
        try {
          const noteId = extractNoteId(formData.note_url)
          const res = await createCommentTask({
            note_id: noteId,
            note_url: formData.note_url,
            max_count: formData.max_count,
            max_duration: formData.max_duration,
            max_consecutive_failures: formData.max_consecutive_failures
          })
          currentTaskId.value = res.task_id
          ElMessage.success(t('core.crawlerTask.createSuccess'))
          resetForm()
        } catch (error) {
          console.error(error)
        } finally {
          loading.value = false
        }
      }
    })
  }

  const resetForm = () => {
    formRef.value?.resetFields()
  }
</script>
