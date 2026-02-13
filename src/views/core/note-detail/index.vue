<template>
  <div class="note-detail art-full-height">
    <div class="art-custom-card">
      <SearchBar
        :model-value="searchForm"
        :items="searchItems"
        :labelWidth="90"
        :span="6"
        :gutter="12"
        size="small"
        @update:model-value="Object.assign(searchForm, $event)"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #actions>
          <ElButton type="primary" @click="handleExport">{{
            t('core.noteDetail.exportExcel')
          }}</ElButton>
        </template>
      </SearchBar>
    </div>

    <ElCard
      class="art-table-card"
      shadow="never"
      :body-style="{ padding: '0px' }"
      style="margin-top: 0px"
    >
      <Table
        :loading="loading"
        :data="tableData"
        :columns="columns as any"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>
    <NoteDetailDialog
      v-model:visible="detailVisible"
      :data="detailData"
      @update:data="detailData = $event"
    />

  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, onMounted, h } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage, ElButton } from 'element-plus'
  import {
    searchNoteDetails,
    exportNoteDetailExcel,
    getNoteDetailInfo,
    type NoteDetail,
    type NoteSearchParams
  } from '@/api/automation/note'
  import NoteDetailDialog from './NoteDetailDialog.vue'
  import TipsPanel from '@/components/core/widget/tips-panel/index.vue'

  defineOptions({ name: 'CoreNoteDetail' })

  const { t } = useI18n()

  // -- Search Form --
  const searchForm = reactive<NoteSearchParams>({
    keyword: '',
    note_type: '',
    user_id: '',
    daterange: undefined,
    sort_by: 'created_at',
    sort_order: 'desc'
  })

  const TYPE_OPTIONS = [
    { label: 'normal', value: 'normal' },
    { label: 'video', value: 'video' }
  ]

  const searchItems = computed(() => [
    {
      label: t('core.noteDetail.keyword'),
      key: 'keyword',
      type: 'input',
      placeholder: t('core.noteDetail.keywordPlaceholder'),
      clearable: true
    },
    {
      label: t('core.noteDetail.type'),
      key: 'note_type',
      type: 'select',
      props: { options: TYPE_OPTIONS }
    },
    {
      label: t('core.noteDetail.userId'),
      key: 'user_id',
      type: 'input',
      placeholder: t('core.noteDetail.userIdPlaceholder')
    },
    {
      label: t('core.noteDetail.dateRange'),
      key: 'daterange',
      type: 'datetime',
      props: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        rangeSeparator: t('core.noteDetail.to'),
        startPlaceholder: t('core.commentManage.startDate'),
        endPlaceholder: t('core.commentManage.endDate')
      }
    },
    {
      label: t('core.noteDetail.sortBy'),
      key: 'sort_by',
      type: 'select',
      props: {
        options: [
          { label: t('core.noteDetail.createdAt'), value: 'created_at' },
          { label: t('core.noteDetail.publishTime'), value: 'publish_time' },
          { label: t('core.noteDetail.likedCount'), value: 'liked_count' },
          { label: t('core.noteDetail.collectedCount'), value: 'collected_count' },
          { label: t('core.noteDetail.commentCount'), value: 'comment_count' },
          { label: t('core.noteDetail.shareCount'), value: 'share_count' }
        ]
      }
    },
    {
      label: t('core.commentManage.sortOrder'),
      key: 'sort_order',
      type: 'select',
      props: {
        options: [
          { label: t('core.commentManage.desc'), value: 'desc' },
          { label: t('core.commentManage.asc'), value: 'asc' }
        ]
      }
    }
  ])

  // -- Table Data --
  const loading = ref(false)
  const tableData = ref<NoteDetail[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })

  const columns = computed(() => [
    { type: 'index', label: t('core.commentManage.index'), width: 60 },
    {
      prop: 'title',
      label: t('core.taskList.drawer.title'),
      minWidth: 260,
      showOverflowTooltip: true
    },
    { prop: 'note_type', label: t('core.noteDetail.type'), width: 100 },
    { prop: 'user_nickname', label: t('core.commentManage.nickname'), minWidth: 140 },
    { prop: 'liked_count', label: t('core.noteDetail.likedCount'), width: 90 },
    { prop: 'collected_count', label: t('core.noteDetail.collectedCount'), width: 90 },
    { prop: 'comment_count', label: t('core.noteDetail.commentCount'), width: 90 },
    { prop: 'share_count', label: t('core.noteDetail.shareCount'), width: 90 },
    { prop: 'publish_time', label: t('core.noteDetail.publishTime'), width: 180 },
    { prop: 'created_at', label: t('core.noteDetail.createdAt'), width: 180 },
    { prop: 'note_id', label: t('core.commentManage.noteId'), minWidth: 160 },
    { prop: 'user_id', label: t('core.noteDetail.userId'), minWidth: 160 },
    {
      prop: 'operation',
      label: t('core.noteDetail.action'),
      width: 120,
      fixed: 'right',
      formatter: (row: NoteDetail) =>
        h(
          ElButton,
          { type: 'primary', link: false, size: 'small', onClick: () => openDetail(row) },
          () => t('core.taskList.view')
        )
    }
  ])

  // -- Actions --
  const loadList = async () => {
    loading.value = true
    try {
      const [start, end] = Array.isArray(searchForm.daterange)
        ? searchForm.daterange
        : [undefined, undefined]

      const params: NoteSearchParams = {
        keyword: searchForm.keyword || undefined,
        note_type: searchForm.note_type || undefined,
        user_id: searchForm.user_id || undefined,
        daterange: Array.isArray(searchForm.daterange) ? searchForm.daterange : undefined,
        page: pagination.current,
        page_size: pagination.size,
        sort_by: searchForm.sort_by,
        sort_order: searchForm.sort_order
      }

      const res = await searchNoteDetails(params)
      // Robust handling for various backend response formats
      const items = res.items || (res as any).records || []
      tableData.value = items
      pagination.total =
        res.total || (res as any).pagination?.total || (res as any).total || items.length
    } catch (e) {
      console.error('Failed to load note list', e)
      tableData.value = []
      pagination.total = 0
    } finally {
      loading.value = false
    }
  }

  onMounted(loadList)

  const handleSearch = () => {
    pagination.current = 1
    loadList()
  }

  const handleReset = () => {
    // Reset form fields
    searchForm.keyword = ''
    searchForm.note_type = ''
    searchForm.user_id = ''
    searchForm.daterange = undefined
    searchForm.sort_by = 'created_at'
    searchForm.sort_order = 'desc'

    handleSearch()
  }

  const handleSizeChange = (val: number) => {
    pagination.size = val
    loadList()
  }

  const handleCurrentChange = (val: number) => {
    pagination.current = val
    loadList()
  }

  const handleExport = async () => {
    try {
      await exportNoteDetailExcel()
      ElMessage.success(t('core.noteDetail.exportExcel'))
    } catch {
      ElMessage.error(t('core.commentManage.exportFailed'))
    }
  }

  // -- Detail Dialog --
  const detailVisible = ref(false)
  const detailData = ref<Partial<NoteDetail>>({})

  const openDetail = async (row: NoteDetail) => {
    detailVisible.value = true
    // Optimistically show row data first
    detailData.value = { ...row }

    if (row.note_id) {
      try {
        const info = await getNoteDetailInfo(row.note_id)
        if (info) {
          detailData.value = info
        }
      } catch (e) {
        console.error('Failed to fetch detailed info', e)
      }
    }
  }
</script>

<style scoped lang="scss">
  .note-detail {
    .card-title {
      font-weight: 600;
      color: var(--art-text-gray-800);
    }
  }
</style>
