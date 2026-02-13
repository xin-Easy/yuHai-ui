<template>
  <el-drawer v-model="visible" :title="title" size="80%" :destroy-on-close="true">
    <div v-if="props.taskType === 'browse_agent'" class="mb-4">
      <el-radio-group v-model="viewType" @change="handleViewChange">
        <el-radio-button label="info">{{ t('core.taskList.taskInfo') }}</el-radio-button>
        <el-radio-button v-if="availableViews.includes('notes')" label="notes">
          {{ t('core.taskList.collectedNotes') }}
        </el-radio-button>
        <el-radio-button v-if="availableViews.includes('comments')" label="comments"
          >{{ t('core.taskList.collectedComments') }}</el-radio-button
        >
      </el-radio-group>
    </div>

    <el-table v-loading="loading" :data="tableData" border style="width: 100%">
      <template v-for="col in columns" :key="col.prop">
        <el-table-column
          :prop="col.prop"
          :label="col.label"
          :min-width="col.width || 120"
          show-overflow-tooltip
        >
          <template v-if="col.isImage" #default="{ row }">
            <el-image
              v-if="col.prop === 'cover_url' && row.cover_resource_id"
              :src="getNoteResourceImageUrl(row.cover_resource_id)"
              :preview-src-list="[getNoteResourceImageUrl(row.cover_resource_id)]"
              fit="cover"
              class="w-16 h-16 rounded"
              hide-on-click-modal
              preview-teleported
            />
            <el-image
              v-else-if="row[col.prop]"
              :src="row[col.prop]"
              :preview-src-list="[row[col.prop]]"
              fit="cover"
              class="w-16 h-16 rounded"
              hide-on-click-modal
              preview-teleported
            />
            <span v-else class="text-gray-400">{{ t('core.taskList.noImage') }}</span>
          </template>
          <template v-else-if="col.isLink" #default="{ row }">
            <a
              v-if="row[col.prop]"
              :href="row[col.prop]"
              target="_blank"
              class="text-blue-500 hover:underline"
            >
              {{ row[col.prop] }}
            </a>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <div class="mt-4 flex justify-end">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    getTaskNotes,
    getTaskComments,
    getTaskNoteDetails,
    getTaskStatus,
    normalizeTaskStats
  } from '@/api/automation/task'
  import { getNoteResourceImageUrl } from '@/api/automation/note'

  const props = defineProps<{
    modelValue: boolean
    taskId: string
    taskType: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const { t } = useI18n()
  const visible = ref(props.modelValue)
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const title = ref(t('core.taskList.resultTitle'))
  const columns = ref<any[]>([])
  const viewType = ref('info')
  const availableViews = ref<string[]>(['info'])

  watch(
    () => props.modelValue,
    (val) => {
      visible.value = val
      if (val && props.taskId) {
        viewType.value = '' // Reset view type to trigger auto-selection
        fetchData()
      }
    }
  )

  watch(visible, (val) => {
    emit('update:modelValue', val)
  })

  const getColumnsByType = (type: string) => {
    switch (type) {
      case 'collect_notes':
      case 'notes': // Alias for browse_agent view
        title.value = t('core.taskList.drawer.collectedNotesList')
        return [
          { prop: 'title', label: t('core.taskList.drawer.title'), width: 200 },
          { prop: 'note_id', label: t('core.taskList.drawer.noteId'), width: 150 },
          { prop: 'type', label: t('core.taskList.drawer.type'), width: 100 },
          { prop: 'user_nickname', label: t('core.taskList.drawer.publisher'), width: 120 },
          { prop: 'liked_count', label: t('core.taskList.drawer.likes'), width: 100 },
          { prop: 'collected_count', label: t('core.taskList.drawer.collects'), width: 100 },
          { prop: 'comment_count', label: t('core.taskList.drawer.comments'), width: 100 },
          { prop: 'share_count', label: t('core.taskList.drawer.shares'), width: 100 },
          { prop: 'cover_url', label: t('core.taskList.drawer.cover'), width: 120, isImage: true },
          { prop: 'note_url', label: t('core.taskList.drawer.link'), width: 200, isLink: true }
        ]
      case 'collect_comments':
      case 'comments': // Alias for browse_agent view
        title.value = t('core.taskList.drawer.collectedCommentsList')
        return [
          { prop: 'content', label: t('core.taskList.drawer.commentContent'), width: 300 },
          { prop: 'user_nickname', label: t('core.taskList.drawer.commenter'), width: 120 },
          { prop: 'liked_count', label: t('core.taskList.drawer.likes'), width: 100 },
          { prop: 'create_time', label: t('core.taskList.drawer.commentTime'), width: 180 },
          { prop: 'sub_comment_count', label: t('core.taskList.drawer.replies'), width: 100 }
        ]
      case 'collect_note_details':
        title.value = t('core.taskList.drawer.noteDetailsList')
        return [
          { prop: 'title', label: t('core.taskList.drawer.title'), width: 200 },
          { prop: 'desc', label: t('core.taskList.drawer.description'), width: 300 },
          { prop: 'tags', label: t('core.taskList.drawer.tags'), width: 200 },
          { prop: 'note_id', label: t('core.taskList.drawer.noteId'), width: 150 },
          { prop: 'user_nickname', label: t('core.taskList.drawer.publisher'), width: 120 },
          { prop: 'liked_count', label: t('core.taskList.drawer.likes'), width: 100 },
          { prop: 'cover_url', label: t('core.taskList.drawer.cover'), width: 120, isImage: true },
          { prop: 'note_url', label: t('core.taskList.drawer.link'), width: 200, isLink: true }
        ]
      case 'browse_agent':
      case 'info': // Alias
        title.value = t('core.taskList.drawer.agentTaskDetails')
        return [
          { prop: 'key', label: t('core.taskList.drawer.property'), width: 150 },
          { prop: 'value', label: t('core.taskList.drawer.value'), width: 400 }
        ]
      default:
        return []
    }
  }

  const handleViewChange = () => {
    currentPage.value = 1
    fetchData()
  }

  const fetchData = async () => {
    loading.value = true
    try {
      let res: any = null
      const params = {
        page: currentPage.value,
        size: pageSize.value
      }

      if (props.taskType === 'browse_agent') {
        // For agent tasks, fetch status first to determine available views
        const task = await getTaskStatus(props.taskId)
        if (task) {
          // Update available views
          const views = ['info']
          if (task.stats) {
            const s = normalizeTaskStats(task.stats)
            if (s.notes > 0) views.push('notes')
            if (s.comments > 0) views.push('comments')
          }
          availableViews.value = views

          // Auto-select view if not set or invalid
          if (!viewType.value || !views.includes(viewType.value)) {
            if (views.includes('notes')) viewType.value = 'notes'
            else if (views.includes('comments')) viewType.value = 'comments'
            else viewType.value = 'info'
          }

          // Set columns based on current viewType
          columns.value = getColumnsByType(viewType.value)

          // Fetch data based on viewType
          if (viewType.value === 'info') {
            const items = [
              { key: t('core.taskList.taskId'), value: task.task_id },
              { key: t('core.taskList.status'), value: task.status },
              { key: t('core.taskList.message'), value: task.message || '-' },
              { key: t('core.taskList.createdAt'), value: task.created_at },
              { key: t('core.taskList.drawer.updatedAt'), value: task.updated_at }
            ]

            if (task.stats) {
              const s = normalizeTaskStats(task.stats)
              items.push({ key: t('core.taskList.drawer.notesCollected'), value: String(s.notes) })
              items.push({ key: t('core.taskList.drawer.commentsCollected'), value: String(s.comments) })
              if (s.consecutive_failures > 0) {
                items.push({
                  key: t('core.taskList.drawer.consecutiveFailures'),
                  value: String(s.consecutive_failures)
                })
              }
            }

            items.push({
              key: t('core.taskList.drawer.params'),
              value: JSON.stringify(task.params || {}, null, 2)
            })

            res = {
              items: items,
              total: items.length
            }
          } else if (viewType.value === 'notes') {
            res = await getTaskNotes(props.taskId, params)
          } else if (viewType.value === 'comments') {
            res = await getTaskComments(props.taskId, params)
          }
        }
      } else {
        // Standard handling for specific task types
        columns.value = getColumnsByType(props.taskType)

        if (props.taskType === 'collect_notes') {
          res = await getTaskNotes(props.taskId, params)
        } else if (props.taskType === 'collect_comments') {
          res = await getTaskComments(props.taskId, params)
        } else if (props.taskType === 'collect_note_details') {
          res = await getTaskNoteDetails(props.taskId, params)
        }

        // Fallback
        if (!res && props.taskType === 'collect_notes') {
          res = await getTaskNotes(props.taskId, params)
        }
      }

      if (res) {
        tableData.value = res.items || []
        total.value = res.total || 0
      } else {
        tableData.value = []
        total.value = 0
      }
    } catch (error) {
      console.error('Failed to fetch task results:', error)
      tableData.value = []
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = (val: number) => {
    pageSize.value = val
    fetchData()
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    fetchData()
  }
</script>
