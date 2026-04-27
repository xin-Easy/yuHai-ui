<template>
  <div class="task-list p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-medium">{{ t('core.taskList.title') }}</span>
          <el-button type="primary" @click="fetchData">{{ t('core.taskList.refresh') }}</el-button>
        </div>
      </template>

      <ArtTable ref="tableRef" :loading="loading" :columns="columns" :data="tableData" border>
        <template #task_id="{ row }">
          <el-tooltip :content="row.task_id" placement="top">
            <span class="cursor-pointer">{{ row.task_id.slice(0, 8) }}...</span>
          </el-tooltip>
        </template>
        <template #type="{ row }">
          <el-tag>{{ formatTaskType(row.type) }}</el-tag>
        </template>
        <template #status="{ row }">
          <el-tag :type="getStatusType(row.status) as any">{{ row.status }}</el-tag>
        </template>
        <template #progress="{ row }">
          <div v-if="row.target_count > 0">
            <el-progress
              :percentage="calculatePercentage(row.current_count, row.target_count)"
              :status="
                row.status === 'failed' ? 'exception' : row.status === 'completed' ? 'success' : ''
              "
            />
            <div class="text-xs text-gray-500 mt-1">
              {{ row.current_count }} / {{ row.target_count }}
            </div>
          </div>
          <span v-else>-</span>
        </template>
        <template #message="{ row }">
          <el-tooltip :content="row.message || '-'" placement="top">
            <span>{{ row.message || '-' }}</span>
          </el-tooltip>
        </template>
        <template #action="{ row }">
          <el-button
            v-if="shouldShowViewButton(row)"
            link
            type="primary"
            @click="handleViewResults(row)"
          >
            {{ t('core.taskList.view') }}
          </el-button>
          <el-button
            v-if="['pending', 'running'].includes(row.status)"
            link
            type="danger"
            @click="handleStop(row)"
          >
            {{ t('core.taskList.stop') }}
          </el-button>
          <el-popconfirm :title="t('core.taskList.deleteConfirm')" @confirm="handleDelete(row)">
            <template #reference>
              <el-button link type="info">{{ t('core.taskList.delete') }}</el-button>
            </template>
          </el-popconfirm>
        </template>
      </ArtTable>
    </el-card>

    <TaskResultDrawer
      v-model="resultDrawerVisible"
      :task-id="currentTaskId"
      :task-type="currentTaskType"
    />

    <TipsPanel class="mt-4" title="任务列表提示">
      <ul>
        <li>查看所有自动化任务的执行状态和进度。</li>
        <li>支持终止正在运行的任务或删除已完成/失败的任务。</li>
        <li>点击"查看结果"可查看任务采集到的具体数据。</li>
      </ul>
    </TipsPanel>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import { getTasks, stopTask, deleteTask, type Task } from '@/api/automation/task'
  import TaskResultDrawer from './components/TaskResultDrawer.vue'
  import TipsPanel from '@/components/core/widget/tips-panel/index.vue'
  import ArtTable from '@/components/core/tables/table/index.vue'
  import type { ColumnOption } from '@/types'

  defineOptions({ name: 'TaskList' })

  const { t } = useI18n()
  const tableRef = ref()
  const loading = ref(false)
  const tableData = ref<Task[]>([])
  const resultDrawerVisible = ref(false)
  const currentTaskId = ref('')
  const currentTaskType = ref('')

  const columns: ColumnOption[] = [
    {
      prop: 'task_id',
      label: t('core.taskList.taskId'),
      minWidth: '180',
      useSlot: true,
      slotName: 'task_id'
    },
    {
      prop: 'type',
      label: t('core.taskList.taskType'),
      width: 150,
      useSlot: true,
      slotName: 'type'
    },
    {
      prop: 'status',
      label: t('core.taskList.status'),
      width: 120,
      useSlot: true,
      slotName: 'status'
    },
    {
      label: t('core.taskList.progress'),
      width: 200,
      useSlot: true,
      slotName: 'progress'
    },
    {
      prop: 'message',
      label: t('core.taskList.message'),
      minWidth: '200',
      useSlot: true,
      slotName: 'message'
    },
    {
      prop: 'created_at',
      label: t('core.taskList.createdAt'),
      width: 180
    },
    {
      prop: 'action',
      label: t('core.taskList.action'),
      width: 150,
      fixed: 'right',
      useSlot: true,
      slotName: 'action'
    }
  ]

  const handleViewResults = (row: Task) => {
    currentTaskId.value = row.task_id
    currentTaskType.value = row.type
    resultDrawerVisible.value = true
  }

  const shouldShowViewButton = (row: Task) => {
    // Collection tasks need items to view
    if (['collect_notes', 'collect_comments'].includes(row.type)) {
      return (row.current_count || 0) > 0
    }
    // Agent browse tasks can always be viewed (for logs/details)
    return row.type === 'browse_agent'
  }

  const formatTaskType = (type: string) => {
    const map: Record<string, string> = {
      collect_notes: t('core.taskList.collectedNotes'),
      collect_comments: t('core.taskList.collectedComments'),
      collect_user_info: t('core.taskList.collectUserInfo'),
      browse_agent: t('core.taskList.browseAgent')
    }
    return map[type] || type
  }

  const getStatusType = (status: string) => {
    const map: Record<string, string> = {
      pending: 'info',
      running: 'primary',
      completed: 'success',
      failed: 'danger',
      stopped: 'warning'
    }
    return map[status] || 'info'
  }

  const calculatePercentage = (current: number = 0, target: number = 0) => {
    if (!target) return 0
    return Math.min(Math.round((current / target) * 100), 100)
  }

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getTasks()
      tableData.value = res || []
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const handleStop = async (row: Task) => {
    try {
      await stopTask(row.task_id)
      ElMessage.success(t('core.taskList.stopCommandSent'))
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (row: Task) => {
    try {
      await deleteTask(row.task_id)
      ElMessage.success(t('core.taskList.deleteSuccess'))
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  onMounted(() => {
    fetchData()
  })
</script>
