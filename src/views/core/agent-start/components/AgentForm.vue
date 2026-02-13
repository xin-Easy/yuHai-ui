<template>
  <div class="agent-form">
    <template v-if="template">
      <div class="mb-4">
        <h3 class="text-lg font-medium">{{ template.name }}</h3>
        <p class="text-gray-500 text-sm mt-1">{{ template.description }}</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Left Column: Parameters and Config -->
        <div class="flex-1 min-w-0">
          <el-form :model="formData" label-width="120px">
            <template v-if="template.params && template.params.length">
              <div class="p-4 bg-gray-50 rounded mb-4">
                <h4 class="mb-4 text-sm font-medium text-gray-700">{{
                  t('core.agentStart.paramsConfig')
                }}</h4>
                <el-form-item
                  v-for="param in template.params"
                  :key="param.name"
                  :label="param.name"
                >
                  <el-input v-model="formData[param.name]" :placeholder="param.description" />
                  <div class="text-xs text-gray-400 mt-1 leading-tight">{{
                    param.description
                  }}</div>
                </el-form-item>
              </div>
            </template>
            <template v-else>
              <el-empty :description="t('core.agentStart.noParams')" :image-size="60" />
            </template>

            <!-- Stop Conditions Section -->
            <div class="p-4 bg-gray-50 rounded mb-4">
              <h4 class="mb-4 text-sm font-medium text-gray-700">{{
                t('core.agentStart.stopConditions')
              }}</h4>
              <el-row :gutter="24">
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="t('core.agentStart.maxCount')">
                    <el-input-number
                      v-model="stopSettings.max_count"
                      :min="0"
                      :step="10"
                      controls-position="right"
                      class="w-full"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="t('core.agentStart.maxDuration')">
                    <el-input-number
                      v-model="stopSettings.max_duration"
                      :min="0"
                      :step="60"
                      controls-position="right"
                      class="w-full"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="t('core.agentStart.maxConsecutiveFailures')">
                    <el-input-number
                      v-model="stopSettings.max_consecutive_failures"
                      :min="0"
                      :max="50"
                      controls-position="right"
                      class="w-full"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="t('core.agentStart.maxNotesCount')">
                    <el-input-number
                      v-model="stopSettings.max_notes_count"
                      :min="0"
                      :step="10"
                      controls-position="right"
                      class="w-full"
                      :placeholder="t('core.agentStart.unlimited')"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="t('core.agentStart.maxCommentsCount')">
                    <el-input-number
                      v-model="stopSettings.max_comments_count"
                      :min="0"
                      :step="10"
                      controls-position="right"
                      class="w-full"
                      :placeholder="t('core.agentStart.unlimited')"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <el-form-item>
              <el-button
                v-if="!isTaskRunning"
                type="primary"
                :loading="loading"
                @click="handleSubmit"
              >
                {{ currentTaskId ? t('core.agentStart.restart') : t('core.agentStart.startTask') }}
              </el-button>
              <el-button v-else type="danger" @click="handleStop">
                {{ t('core.agentStart.stopTask') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Right Column: Status Monitor -->
        <div class="w-full lg:w-[350px] flex-shrink-0">
          <div v-if="currentTaskId" class="sticky top-4">
            <TaskStatusMonitor
              :task-id="currentTaskId"
              @completed="handleTaskComplete"
              @stopped="handleTaskComplete"
              @failed="handleTaskComplete"
            />
          </div>
          <div
            v-else
            class="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 min-h-[300px]"
          >
            <div class="text-center text-gray-400">
              <el-icon class="text-4xl mb-2"><Monitor /></el-icon>
              <p>{{ t('core.agentStart.monitorPlaceholder') }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="loadingTemplate">
      <el-skeleton :rows="5" animated />
    </template>
    <template v-else>
      <el-empty :description="t('core.agentStart.templateNotFound')" />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import { Monitor } from '@element-plus/icons-vue'
  import { startAgentTask, stopAgentTask, type AgentTemplate } from '@/api/automation/task'
  import TaskStatusMonitor from '@/components/TaskStatusMonitor.vue'

  const props = defineProps<{
    templateId: string
    templateData?: AgentTemplate // Optional: pass directly if available
  }>()

  const loading = ref(false)
  const loadingTemplate = ref(false)
  const template = ref<AgentTemplate | undefined>(props.templateData)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const emit = defineEmits(['update:templateData'])

  const { t } = useI18n()

  const formData = ref<Record<string, any>>({})
  const currentTaskId = ref('')
  const isTaskRunning = ref(false)
  const stopSettings = ref({
    max_count: 0,
    max_duration: 0,
    max_consecutive_failures: 3,
    max_notes_count: 0,
    max_comments_count: 0
  })

  // Initialize form data from template defaults
  const initForm = () => {
    if (template.value && template.value.params) {
      const params: Record<string, any> = {}
      template.value.params.forEach((p) => {
        params[p.name] = p.default || ''
      })
      formData.value = params
    } else {
      formData.value = {}
    }
  }

  watch(
    () => props.templateData,
    (newVal) => {
      if (newVal) {
        template.value = newVal
        initForm()
      }
    },
    { immediate: true }
  )

  const handleSubmit = async () => {
    if (!template.value) return

    try {
      loading.value = true

      // Reset status if restarting
      if (currentTaskId.value && !isTaskRunning.value) {
        currentTaskId.value = ''
      }

      const res = await startAgentTask({
        template_id: template.value.id,
        template_params: formData.value,
        ...stopSettings.value
      })
      currentTaskId.value = res.task_id
      isTaskRunning.value = true
      ElMessage.success(`${template.value.name} ${t('core.agentStart.startSuccess')}`)
    } catch (e: any) {
      console.error(e)
      ElMessage.error(e.message || t('core.agentStart.startFailed'))
    } finally {
      loading.value = false
    }
  }

  const handleStop = async () => {
    try {
      await stopAgentTask()
      ElMessage.success(t('core.agentStart.stopCommandSent'))
    } catch (error) {
      console.error(error)
    }
  }

  const handleTaskComplete = () => {
    isTaskRunning.value = false
    // Don't clear currentTaskId immediately so the monitor stays visible with final results.
    // The monitor itself handles displaying "completed" state.
  }
</script>
