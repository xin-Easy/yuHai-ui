<template>
  <div class="task-status-monitor" v-if="taskData">
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-medium">任务状态监控</span>
            <el-tag :type="statusType" size="small">{{ taskData.status }}</el-tag>
          </div>
        </div>
      </template>

      <div class="monitor-content space-y-4">
        <!-- Message -->
        <div v-if="taskData.message" class="text-sm text-gray-500 bg-gray-50 p-2 rounded">
          {{ taskData.message }}
        </div>

        <!-- Progress Indicators -->
        <div class="progress-section" v-if="hasStopConditions">
          <!-- Total Count -->
          <div v-if="limits.max_count > 0" class="progress-item">
            <div class="flex justify-between text-sm mb-1">
              <span>总采集进度</span>
              <span>{{ taskData.current_count || 0 }} / {{ limits.max_count }}</span>
            </div>
            <el-progress
              :percentage="calculatePercentage(taskData.current_count || 0, limits.max_count)"
            />
          </div>

          <!-- Notes Count -->
          <div v-if="limits.max_notes_count > 0" class="progress-item mt-2">
            <div class="flex justify-between text-sm mb-1">
              <span>笔记采集进度</span>
              <span>{{ stats.notes || 0 }} / {{ limits.max_notes_count }}</span>
            </div>
            <el-progress
              :percentage="calculatePercentage(stats.notes || 0, limits.max_notes_count)"
              status="success"
            />
          </div>

          <!-- Comments Count -->
          <div v-if="limits.max_comments_count > 0" class="progress-item mt-2">
            <div class="flex justify-between text-sm mb-1">
              <span>评论采集进度</span>
              <span>{{ stats.comments || 0 }} / {{ limits.max_comments_count }}</span>
            </div>
            <el-progress
              :percentage="calculatePercentage(stats.comments || 0, limits.max_comments_count)"
              status="warning"
            />
          </div>

          <!-- Duration -->
          <div v-if="limits.max_duration > 0" class="progress-item mt-2">
            <div class="flex justify-between text-sm mb-1">
              <span>运行时长 (秒)</span>
              <span>{{ duration }} / {{ limits.max_duration }}</span>
            </div>
            <el-progress
              :percentage="calculatePercentage(duration, limits.max_duration)"
              :format="() => formatDuration(duration)"
            />
          </div>

          <!-- Consecutive Failures -->
          <div v-if="limits.max_consecutive_failures > 0" class="progress-item mt-2">
            <div class="flex justify-between text-sm mb-1">
              <span>连续失败次数</span>
              <span :class="{ 'text-red-500': (stats.consecutive_failures || 0) > 0 }">
                {{ stats.consecutive_failures || 0 }} / {{ limits.max_consecutive_failures }}
              </span>
            </div>
            <el-progress
              :percentage="
                calculatePercentage(
                  stats.consecutive_failures || 0,
                  limits.max_consecutive_failures
                )
              "
              status="exception"
            />
          </div>
        </div>
        <div v-else class="text-center text-gray-400 text-sm py-2">
          无停止条件限制，任务将持续运行
        </div>

        <!-- Basic Stats Grid -->
        <div class="stats-grid grid grid-cols-2 gap-4 pt-2 border-t mt-4">
          <div class="stat-item text-center">
            <div class="text-xs text-gray-500">已采集总数</div>
            <div class="text-lg font-bold">{{ taskData.current_count || 0 }}</div>
          </div>
          <div class="stat-item text-center">
            <div class="text-xs text-gray-500">运行时长</div>
            <div class="text-lg font-bold">{{ formatDuration(duration) }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import {
    getTaskStatus,
    stopTask,
    normalizeTaskStats,
    type TaskStatusResponse
  } from '@/api/automation/task'
  import { ElMessage, ElMessageBox } from 'element-plus'

  const props = defineProps<{
    taskId: string
    pollInterval?: number
  }>()

  const emit = defineEmits(['update:status', 'stopped', 'completed', 'failed'])

  const taskData = ref<TaskStatusResponse | null>(null)
  const timer = ref<number | null>(null)
  const stopping = ref(false)
  const duration = ref(0)

  const isRunning = computed(() => {
    return taskData.value?.status === 'running' || taskData.value?.status === 'pending'
  })

  const statusType = computed(() => {
    switch (taskData.value?.status) {
      case 'running':
        return 'primary'
      case 'completed':
        return 'success'
      case 'failed':
        return 'danger'
      case 'stopped':
        return 'info'
      default:
        return 'info'
    }
  })

  const limits = computed(
    () =>
      taskData.value?.stop_condition || {
        max_count: 0,
        max_notes_count: 0,
        max_comments_count: 0,
        max_duration: 0,
        max_consecutive_failures: 0
      }
  )
  const stats = computed(() => normalizeTaskStats(taskData.value?.stats))

  const hasStopConditions = computed(() => {
    const l = limits.value
    return (
      (l.max_count || 0) > 0 ||
      (l.max_notes_count || 0) > 0 ||
      (l.max_comments_count || 0) > 0 ||
      (l.max_duration || 0) > 0 ||
      (l.max_consecutive_failures || 0) > 0
    )
  })

  const calculatePercentage = (current: number, max: number) => {
    if (!max || max <= 0) return 0
    const pct = Math.floor((current / max) * 100)
    return Math.min(pct, 100)
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    return `${m}m ${s}s`
  }

  const updateDuration = () => {
    if (taskData.value?.created_at) {
      const start = new Date(taskData.value.created_at).getTime()
      const now = Date.now()
      duration.value = Math.floor((now - start) / 1000)
    }
  }

  const fetchStatus = async () => {
    if (!props.taskId) return
    try {
      const res = await getTaskStatus(props.taskId)
      taskData.value = res
      emit('update:status', res.status)

      updateDuration()

      // Handle terminal states
      if (['completed', 'failed', 'stopped'].includes(res.status)) {
        stopPolling()
        emit(res.status as any, res)
      }
    } catch (error) {
      console.error('Failed to fetch task status:', error)
    }
  }

  const startPolling = () => {
    stopPolling()
    fetchStatus()
    timer.value = window.setInterval(fetchStatus, props.pollInterval || 3000)
  }

  const stopPolling = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  const handleStop = async () => {
    try {
      await ElMessageBox.confirm('确定要停止当前任务吗？', '提示', {
        type: 'warning',
        confirmButtonText: '停止',
        cancelButtonText: '取消'
      })

      stopping.value = true
      await stopTask(props.taskId)
      ElMessage.success('任务已停止')
      fetchStatus() // Immediate update
    } catch (e) {
      if (e !== 'cancel') {
        console.error(e)
        ElMessage.error('停止失败')
      }
    } finally {
      stopping.value = false
    }
  }

  watch(
    () => props.taskId,
    (newId) => {
      if (newId) {
        startPolling()
      } else {
        stopPolling()
        taskData.value = null
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    if (props.taskId) startPolling()
  })

  onUnmounted(() => {
    stopPolling()
  })
</script>

<style scoped>
  .task-status-monitor {
    @apply w-full;
  }
</style>
