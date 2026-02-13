<template>
  <div class="comment-manage art-full-height">
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
            t('core.commentManage.exportExcel')
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

  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import { searchComments, exportCommentsExcel } from '@/api/automation/comment'
  import TipsPanel from '@/components/core/widget/tips-panel/index.vue'

  defineOptions({ name: 'CoreCommentManage' })

  const { t } = useI18n()

  const searchForm = reactive({
    keyword: '',
    note_id: '',
    user_id: '',
    daterange: undefined as any,
    sort_by: 'create_time' as 'create_time' | 'like_count',
    sort_order: 'desc' as 'asc' | 'desc'
  })

  const searchItems = computed(() => [
    {
      label: t('core.commentManage.keyword'),
      key: 'keyword',
      type: 'input',
      placeholder: t('core.commentManage.keywordPlaceholder'),
      clearable: true
    },
    {
      label: t('core.commentManage.noteId'),
      key: 'note_id',
      type: 'input',
      placeholder: t('core.commentManage.noteIdPlaceholder')
    },
    {
      label: t('core.commentManage.userId'),
      key: 'user_id',
      type: 'input',
      placeholder: t('core.commentManage.userIdPlaceholder')
    },
    {
      label: t('core.commentManage.dateRange'),
      key: 'daterange',
      type: 'datetime',
      props: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        rangeSeparator: '-',
        startPlaceholder: t('core.commentManage.startDate'),
        endPlaceholder: t('core.commentManage.endDate')
      }
    },
    {
      label: t('core.commentManage.sortBy'),
      key: 'sort_by',
      type: 'select',
      props: {
        options: [
          { label: t('core.commentManage.time'), value: 'create_time' },
          { label: t('core.commentManage.likeCount'), value: 'like_count' }
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

  const loading = ref(false)
  const tableData = ref<any[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })

  const columns = computed(() => [
    { type: 'index', label: t('core.commentManage.index'), width: 60 },
    { prop: 'user_nickname', label: t('core.commentManage.nickname'), minWidth: 140 },
    {
      prop: 'content',
      label: t('core.commentManage.content'),
      minWidth: 300,
      showOverflowTooltip: true
    },
    { prop: 'like_count', label: t('core.commentManage.likeCount'), width: 90 },
    { prop: 'liked', label: t('core.commentManage.liked'), width: 90 },
    { prop: 'ip_location', label: t('core.commentManage.ipLocation'), width: 120 },
    { prop: 'sub_comment_count', label: t('core.commentManage.subCommentCount'), width: 100 },
    { prop: 'create_time', label: t('core.commentManage.time'), width: 180 },
    { prop: 'note_id', label: t('core.commentManage.noteId'), minWidth: 160 },
    { prop: 'user_id', label: t('core.commentManage.userId'), minWidth: 160 }
  ])

  const loadList = async () => {
    loading.value = true
    try {
      const [start, end] = Array.isArray(searchForm.daterange)
        ? searchForm.daterange
        : [undefined, undefined]
      const res = await searchComments({
        keyword: searchForm.keyword || undefined,
        note_id: searchForm.note_id || undefined,
        user_id: searchForm.user_id || undefined,
        start_date: start,
        end_date: end,
        page: pagination.current,
        page_size: pagination.size,
        sort_by: searchForm.sort_by,
        sort_order: searchForm.sort_order
      })
      tableData.value = res.items || []
      pagination.total = res.pagination?.total || 0
    } finally {
      loading.value = false
    }
  }
  onMounted(loadList)

  const handleSearch = () => loadList()
  const handleReset = () => {
    Object.assign(searchForm, {
      keyword: '',
      note_id: '',
      user_id: '',
      daterange: undefined,
      sort_by: 'create_time',
      sort_order: 'desc'
    })
    loadList()
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
      const [start, end] = Array.isArray(searchForm.daterange)
        ? searchForm.daterange
        : [undefined, undefined]

      await exportCommentsExcel({
        keyword: searchForm.keyword,
        note_id: searchForm.note_id,
        user_id: searchForm.user_id,
        start_date: start,
        end_date: end,
        sort_by: searchForm.sort_by,
        sort_order: searchForm.sort_order
      })
      ElMessage.success(t('core.commentManage.exportStart'))
    } catch {
      ElMessage.error(t('core.commentManage.exportFailed'))
    }
  }
</script>

<style scoped lang="scss">
  .comment-manage {
    .card-title {
      font-weight: 600;
      color: var(--art-text-gray-800);
    }
    .search-actions {
      padding: 4px 12px;
    }
  }
</style>
