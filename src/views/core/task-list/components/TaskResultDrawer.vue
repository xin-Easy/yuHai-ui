<template>
  <el-drawer v-model="visible" :title="title" size="80%" :destroy-on-close="true">
    <div v-if="props.taskType === 'browse_agent'" class="mb-4">
      <el-radio-group v-model="viewType" @change="handleViewChange">
        <el-radio-button label="info">{{ t('core.taskList.taskInfo') }}</el-radio-button>
        <el-radio-button v-if="availableViews.includes('notes')" label="notes">
          {{ t('core.taskList.collectedNotes') }}
        </el-radio-button>
        <el-radio-button v-if="availableViews.includes('comments')" label="comments">{{
          t('core.taskList.collectedComments')
        }}</el-radio-button>
      </el-radio-group>
    </div>

    <ArtTable
      ref="tableRef"
      :loading="loading"
      :columns="columns"
      :data="tableData"
      border
      :pagination="pagination"
      @pagination:size-change="handleSizeChange"
      @pagination:current-change="handleCurrentChange"
    >
      <template v-for="col in columns" :key="col.prop + '_template'" #[col.prop]="{ row }">
        <template v-if="col.isImage">
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
        <template v-else-if="col.isLink">
          <a
            v-if="row[col.prop]"
            :href="row[col.prop]"
            target="_blank"
            class="text-blue-500 hover:underline"
          >
            {{ row[col.prop] }}
          </a>
        </template>
        <template v-else>
          {{ row[col.prop] }}
        </template>
      </template>
    </ArtTable>
  </el-drawer>
</template>

<script setup lang="ts">
  import { ref, watch, reactive } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    getTaskNotes,
    getTaskComments,
    getTaskNoteDetails,
    getTaskStatus,
    normalizeTaskStats
  } from '@/api/automation/task'
  import { getNoteResourceImageUrl } from '@/api/automation/note'
  import ArtTable from '@/components/core/tables/table/index.vue'
  import type { ColumnOption } from '@/types'

  const props = defineProps<{
    modelValue: boolean
    taskId: string
    taskType: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const { t } = useI18n()
  const tableRef = ref()
  const visible = ref(props.modelValue)
  const loading = ref(false)
  const tableData = ref([])
  const title = ref(t('core.taskList.resultTitle'))
  const columns = ref<ColumnOption[]>([])
  const viewType = ref('info')
  const availableViews = ref<string[]>(['info'])

  const pagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })

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

  const getColumnsByType = (type: string): ColumnOption[] => {
    switch (type) {
      case 'collect_notes':
      case 'notes': // Alias for browse_agent view
        title.value = t('core.taskList.drawer.collectedNotesList')
        return [
          { prop: 'title', label: t('core.taskList.drawer.title'), width: 200, useSlot: true },
          { prop: 'note_id', label: t('core.taskList.drawer.noteId'), width: 150, useSlot: true },
          { prop: 'type', label: t('core.taskList.drawer.type'), width: 100, useSlot: true },
          {
            prop: 'user_nickname',
            label: t('core.taskList.drawer.publisher'),
            width: 120,
            useSlot: true
          },
          {
            prop: 'liked_count',
            label: t('core.taskList.drawer.likes'),
            width: 100,
            useSlot: true
          },
          {
            prop: 'collected_count',
            label: t('core.taskList.drawer.collects'),
            width: 100,
            useSlot: true
          },
          {
            prop: 'comment_count',
            label: t('core.taskList.drawer.comments'),
            width: 100,
            useSlot: true
          },
          {
            prop: 'share_count',
            label: t('core.taskList.drawer.shares'),
            width: 100,
            useSlot: true
          },
          {
            prop: 'cover_url',
            label: t('core.taskList.drawer.cover'),
            width: 120,
            isImage: true,
            useSlot: true
          },
          {
            prop: 'note_url',
            label: t('core.taskList.drawer.link'),
            width: 200,
            isLink: true,
            useSlot: true
          }
        ]
      case 'collect_comments':
      case 'comments': // Alias for browse_agent view
        title.value = t('core.taskList.drawer.collectedCommentsList')
        return [
          {
            prop: 'content',
            label: t('core.taskList.drawer.commentContent'),
            width: 300,
            useSlot: true
          },
          {
            prop: 'user_nickname',
            label: t('core.taskList.drawer.commenter'),
            width: 120,
            useSlot: true
          },
          {
            prop: 'liked_count',
            label: t('core.taskList.drawer.likes'),
            width: 100,
            useSlot: true
          },
          {
            prop: 'create_time',
            label: t('core.taskList.drawer.commentTime'),
            width: 180,
            useSlot: true
          },
          {
            prop: 'sub_comment_count',
            label: t('core.taskList.drawer.replies'),
            width: 100,
            useSlot: true
          }
        ]
      case 'collect_note_details':
        title.value = t('core.taskList.drawer.noteDetailsList')
        return [
          { prop: 'title', label: t('core.taskList.drawer.title'), width: 200, useSlot: true },
          { prop: 'desc', label: t('core.taskList.drawer.description'), width: 300, useSlot: true },
          { prop: 'tags', label: t('core.taskList.drawer.tags'), width: 200, useSlot: true },
          { prop: 'note_id', label: t('core.taskList.drawer.noteId'), width: 150, useSlot: true },
          {
            prop: 'user_nickname',
            label: t('core.taskList.drawer.publisher'),
            width: 120,
            useSlot: true
          },
          {
            prop: 'liked_count',
            label: t('core.taskList.drawer.likes'),
            width: 100,
            useSlot: true
          },
          {
            prop: 'cover_url',
            label: t('core.taskList.drawer.cover'),
            width: 120,
            isImage: true,
            useSlot: true
          },
          {
            prop: 'note_url',
            label: t('core.taskList.drawer.link'),
            width: 200,
            isLink: true,
            useSlot: true
          }
        ]
      case 'browse_agent':
      case 'info': // Alias
        title.value = t('core.taskList.drawer.agentTaskDetails')
        return [
          { prop: 'key', label: t('core.taskList.drawer.property'), width: 150, useSlot: true },
          { prop: 'value', label: t('core.taskList.drawer.value'), width: 400, useSlot: true }
        ]
      default:
        return []
    }
  }

  const handleViewChange = () => {
    pagination.current = 1
    fetchData()
  }

  const fetchData = async () => {
    loading.value = true
    try {
      let res: any = null
      const params = {
        page: pagination.current,
        size: pagination.size
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
              items.push({
                key: t('core.taskList.drawer.commentsCollected'),
                value: String(s.comments)
              })
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
        pagination.total = res.total || 0
      } else {
        tableData.value = []
        pagination.total = 0
      }
    } catch (error) {
      console.error('Failed to fetch task results:', error)
      tableData.value = []
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = (val: number) => {
    pagination.size = val
    fetchData()
  }

  const handleCurrentChange = (val: number) => {
    pagination.current = val
    fetchData()
  }
</script>
