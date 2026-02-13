<template>
  <div class="note-manage art-full-height">
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
          <ElButton type="primary" @click="openCollectDialog">
            {{ t('core.noteManage.collect') }}
          </ElButton>
          <ElButton @click="handleExport">
            {{ t('core.noteManage.export') }}
          </ElButton>
          <ElButton 
            type="danger" 
            :disabled="!selectedIds.length" 
            @click="handleBatchDelete"
          >
            {{ t('core.noteManage.batchDelete') }}
          </ElButton>
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
        ref="tableRef"
        :loading="loading"
        :data="tableData"
        :columns="columns as any"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
      />
    </ElCard>

    <NoteCollectDialog
      v-model:visible="collectVisible"
      @success="handleSearch"
    />

  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, h } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage, ElButton, ElMessageBox, ElImage, ElTag } from 'element-plus'
  import TipsPanel from '@/components/core/widget/tips-panel/index.vue'
  import {
    searchNotes,
    exportNotesToExcel,
    batchDeleteNotes
  } from '@/api/automation/note'
  import NoteCollectDialog from './components/NoteCollectDialog.vue'
  import { mittBus } from '@/utils/sys'

  defineOptions({ name: 'CoreNoteManage' })

  const { t } = useI18n()

  // -- Search Form --
  const searchForm = reactive({
    keyword: '',
    note_type: '',
    user_id: '',
    daterange: undefined as string[] | undefined,
    sort_by: 'created_at',
    sort_order: 'desc'
  })

  const TYPE_OPTIONS = [
    { label: 'normal', value: 'normal' },
    { label: 'video', value: 'video' }
  ]

  const searchItems = computed(() => [
    {
      label: t('core.noteManage.keyword'),
      key: 'keyword',
      type: 'input',
      clearable: true
    },
    {
      label: t('core.noteManage.type'),
      key: 'note_type',
      type: 'select',
      props: { options: TYPE_OPTIONS }
    },
    {
      label: t('core.noteManage.userId'),
      key: 'user_id',
      type: 'input'
    },
    {
      label: t('core.noteManage.dateRange'),
      key: 'daterange',
      type: 'datetime',
      props: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    }
  ])

  // -- Table Data --
  const loading = ref(false)
  const tableData = ref<any[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const selectedIds = ref<string[]>([])

  const columns = computed(() => [
    { type: 'selection', width: 50 },
    { type: 'index', label: '#', width: 60 },
    {
      prop: 'display_title',
      label: '标题', // t('core.noteDetail.title')
      minWidth: 200,
      showOverflowTooltip: true,
      formatter: (row: any) => {
        return h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
          row.cover_url ? h(ElImage, { 
            src: row.cover_url, 
            style: 'width: 40px; height: 40px; border-radius: 4px;',
            fit: 'cover',
            previewSrcList: [row.cover_url],
            previewTeleported: true
          }) : null,
          h('span', row.display_title || '-')
        ])
      }
    },
    { prop: 'note_type', label: t('core.noteManage.type'), width: 100 },
    { 
      prop: 'user_nickname', 
      label: '用户',
      minWidth: 120,
      formatter: (row: any) => row.user_nickname || row.user_id 
    },
    { prop: 'liked_count', label: '点赞', width: 80 },
    { prop: 'collected_count', label: '收藏', width: 80 },
    { prop: 'comment_count', label: '评论', width: 80 },
    { prop: 'shared_count', label: '分享', width: 80 },
    { prop: 'publish_time', label: '发布时间', width: 170 }
  ])

  // -- Actions --
  const handleSearch = () => {
    pagination.current = 1
    loadList()
  }

  const handleReset = () => {
    Object.assign(searchForm, {
      keyword: '',
      note_type: '',
      user_id: '',
      daterange: undefined,
      sort_by: 'created_at',
      sort_order: 'desc'
    })
    handleSearch()
  }

  const loadList = async () => {
    loading.value = true
    try {
      const params = {
        keyword: searchForm.keyword || undefined,
        note_type: searchForm.note_type || undefined,
        user_id: searchForm.user_id || undefined,
        date_range: searchForm.daterange ? {
          start: searchForm.daterange[0],
          end: searchForm.daterange[1]
        } : undefined,
        page: pagination.current,
        page_size: pagination.size
      }
      
      const res = await searchNotes(params)
      tableData.value = res.notes || []
      pagination.total = res.total || 0
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = (val: number) => {
    pagination.size = val
    loadList()
  }

  const handleCurrentChange = (val: number) => {
    pagination.current = val
    loadList()
  }

  const handleSelectionChange = (rows: any[]) => {
    selectedIds.value = rows.map(r => r.note_id)
  }

  // Collect Dialog
  const collectVisible = ref(false)
  const openCollectDialog = () => {
    collectVisible.value = true
  }

  const handleBatchDelete = async () => {
    try {
      await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条笔记吗？`, 'Warning', {
        type: 'warning'
      })
      await batchDeleteNotes(selectedIds.value)
      ElMessage.success(t('core.noteManage.deleteSuccess'))
      mittBus.emit('refresh-stats')
      selectedIds.value = []
      loadList()
    } catch (e) {
      // cancel
    }
  }

  // Export
  const handleExport = async () => {
    try {
      await exportNotesToExcel({
        search: searchForm.keyword,
        start_date: searchForm.daterange?.[0],
        end_date: searchForm.daterange?.[1]
      })
      ElMessage.success('导出成功')
    } catch (e) {
      ElMessage.error('导出失败')
    }
  }

  loadList()
</script>

<style scoped lang="scss">
.note-manage {
  // Add custom styles if needed
}
</style>