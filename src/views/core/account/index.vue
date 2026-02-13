<template>
  <div class="account-page art-full-height">
    <div class="flex items-center justify-between mb-3">
      <div class="text-lg font-medium">{{ t('menus.core.account') }}</div>
    </div>
    <ElRow :gutter="12">
      <ElCol :span="12">
        <ElCard class="art-table-card" shadow="never">
          <template #header>
            <div class="card-title">{{ t('core.account.settings') }}</div>
          </template>
          <div class="settings">
            <div class="flex items-center gap-2">
              <ElInput
                v-model="cookieInput"
                :placeholder="t('core.account.cookiePlaceholder')"
                size="small"
              />
              <ElButton type="primary" @click="handleAddCookie" size="small">{{
                t('core.account.addCookie')
              }}</ElButton>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard class="art-table-card" shadow="never">
          <template #header>
            <div class="card-title">{{ t('core.account.systemEnv') }}</div>
          </template>
          <div class="env-bar">
            <div class="env-left">{{ t('core.account.leftWindowStatus') }}</div>
            <ElTag :type="leftInfo.attached ? 'success' : 'warning'">{{
              leftInfo.attached ? t('core.account.attached') : t('core.account.detached')
            }}</ElTag>
            <ElTag :type="leftInfo.visible ? 'success' : 'info'">{{
              leftInfo.visible ? t('core.account.visible') : t('core.account.hidden')
            }}</ElTag>
            <ElTag :type="leftInfo.focused ? 'success' : 'info'">{{
              leftInfo.focused ? t('core.account.focused') : t('core.account.unfocused')
            }}</ElTag>
            <ElSpace wrap>
              <ElSwitch
                v-model="autoRefresh"
                :active-text="t('core.account.autoRefresh')"
                :inactive-text="t('core.account.manualRefresh')"
              />
              <ElButton @click="refreshLeftInfo">{{ t('core.account.refresh') }}</ElButton>
            </ElSpace>
          </div>
          <div class="env-grid">
            <ElDescriptions :column="3" border size="small">
              <ElDescriptionsItem :label="t('core.account.windowId')">{{
                leftInfo.id ?? '-'
              }}</ElDescriptionsItem>
              <ElDescriptionsItem :label="t('core.account.loading')">{{
                leftInfo.loading
                  ? t('core.account.loadingState.loading')
                  : t('core.account.loadingState.idle')
              }}</ElDescriptionsItem>
              <ElDescriptionsItem :label="t('core.account.devTools')">{{
                leftInfo.devtools ? t('core.account.on') : t('core.account.off')
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="URL" :span="3">{{
                (leftInfo.url || '').split('?')[0] || '-'
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="Left X">{{ leftInfo.leftBounds.x }}</ElDescriptionsItem>
              <ElDescriptionsItem label="Left Y">{{ leftInfo.leftBounds.y }}</ElDescriptionsItem>
              <ElDescriptionsItem label="Left W">{{
                leftInfo.leftBounds.width
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="Left H">{{
                leftInfo.leftBounds.height
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="Main X">{{ leftInfo.mainBounds.x }}</ElDescriptionsItem>
              <ElDescriptionsItem label="Main Y">{{ leftInfo.mainBounds.y }}</ElDescriptionsItem>
              <ElDescriptionsItem label="Main W">{{
                leftInfo.mainBounds.width
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="Main H">{{
                leftInfo.mainBounds.height
              }}</ElDescriptionsItem>
              <ElDescriptionsItem :label="t('core.account.screenId')">{{
                leftInfo.display.id
              }}</ElDescriptionsItem>
              <ElDescriptionsItem :label="t('core.account.scale')">{{
                leftInfo.display.scaleFactor
              }}</ElDescriptionsItem>
              <ElDescriptionsItem :label="t('core.account.resolution')">{{
                `${leftInfo.display.bounds.width}x${leftInfo.display.bounds.height}`
              }}</ElDescriptionsItem>
            </ElDescriptions>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElCard class="art-table-card" shadow="never" style="margin-top: 12px">
      <template #header>
        <div class="card-title">{{ t('core.account.accountList') }}</div>
      </template>
      <Table
        :loading="loading"
        :data="tableData"
        :columns="columns as any"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <TipsPanel class="mt-4" title="账号管理提示">
      <ul>
        <li>在此页面管理系统的账号 Cookie 信息。</li>
        <li>左侧窗口状态实时显示浏览器实例的运行情况。</li>
        <li>添加 Cookie 时请确保格式正确，过期 Cookie 可能导致功能异常。</li>
      </ul>
    </TipsPanel>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, watch, h, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { invoke } from '@tauri-apps/api/core'
  import TipsPanel from '@/components/core/widget/tips-panel/index.vue'
  import {
    ElMessage,
    ElMessageBox,
    ElTag,
    ElLink,
    ElDescriptions,
    ElDescriptionsItem,
    ElSwitch,
    ElInput
  } from 'element-plus'
  import {
    addCookie,
    getAccounts,
    deleteAccount,
    type AccountItem
  } from '@/api/automation/account.ts'

  defineOptions({ name: 'CoreAccount' })

  const { t } = useI18n()

  const cookieInput = ref('')
  const autoRefresh = ref(true)
  const leftInfo = reactive<any>({
    attached: false,
    id: null,
    visible: false,
    focused: false,
    devtools: false,
    loading: false,
    url: '',
    leftBounds: { x: 0, y: 0, width: 0, height: 0 },
    mainBounds: { x: 0, y: 0, width: 0, height: 0 },
    display: { id: 0, scaleFactor: 1, bounds: { width: 0, height: 0 }, workArea: {} }
  })

  const loading = ref(false)
  const tableData = ref<AccountItem[]>([])
  const pagination = reactive({ current: 1, size: 10, total: 0 })

  const fetchList = async () => {
    loading.value = true
    try {
      const res = await getAccounts({ page: pagination.current, per_page: pagination.size })
      tableData.value = res.items
      pagination.total = res.total
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchList()
  })

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  })

  const handleAddCookie = async () => {
    if (!cookieInput.value) {
      ElMessage.warning(t('core.account.cookiePlaceholder'))
      return
    }
    await addCookie(cookieInput.value)
    ElMessage.success(t('core.account.cookieAdded'))
    cookieInput.value = ''
    fetchList()
  }

  const refreshLeftInfo = async () => {
    try {
      if (window.__TAURI_INTERNALS__) {
        const res = await invoke('get_left_window_info')
        Object.assign(leftInfo, res || {})
      }
    } catch (e) {
      console.error('Failed to get left window info:', e)
    }
  }

  let timer: number | null = null
  watch(
    autoRefresh,
    (v) => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      if (v) {
        timer = window.setInterval(refreshLeftInfo, 1000)
      }
    },
    { immediate: true }
  )

  const editRow = (row: AccountItem) => {
    ElMessageBox.alert(
      `${t('core.account.editAccount')}: ${row.name ?? ''}`,
      t('core.account.edit'),
      { confirmButtonText: t('core.account.confirm') }
    )
  }

  const toggleLogin = (row: AccountItem) => {
    ElMessage.success(`${t('core.account.toggleLogin')}: ${row.name ?? ''}`)
  }

  const removeRow = async (row: AccountItem) => {
    await ElMessageBox.confirm(
      t('core.account.deletePrompt', { name: row.name ?? '' }),
      t('core.account.deleteConfirm'),
      {
        confirmButtonText: t('core.account.confirm'),
        cancelButtonText: t('core.account.cancel'),
        type: 'warning'
      }
    )
    await deleteAccount(row.id)
    ElMessage.success(t('core.account.deleteSuccess'))
    fetchList()
  }

  const columns = computed(() => [
    { type: 'index', label: t('table.column.index'), width: 60 },
    { prop: 'name', label: t('core.account.columns.name'), minWidth: 120 },
    { prop: 'red_book_id', label: t('core.account.columns.redBookId'), minWidth: 120 },
    { prop: 'follow_count', label: t('core.account.columns.followCount'), minWidth: 100 },
    { prop: 'fans_count', label: t('core.account.columns.fansCount'), minWidth: 100 },
    {
      prop: 'likes_and_collections',
      label: t('core.account.columns.likesAndCollections'),
      minWidth: 150,
      showOverflowTooltip: true
    },
    { prop: 'login_time', label: t('core.account.columns.loginTime'), width: 180 },
    { prop: 'last_login_time', label: t('core.account.columns.lastLoginTime'), width: 180 },
    {
      prop: 'operation',
      label: t('core.taskList.action'),
      width: 200,
      fixed: 'right' as const,
      formatter: (row: AccountItem) =>
        h('div', [
          h(ElLink, { type: 'primary', onClick: () => editRow(row) }, () => t('core.account.edit')),
          h(ElLink, { style: 'margin: 0 8px', onClick: () => toggleLogin(row) }, () =>
            t('core.account.toggleLogin')
          ),
          h(ElLink, { type: 'danger', onClick: () => removeRow(row) }, () =>
            t('core.account.delete')
          )
        ])
    }
  ])

  const handleSizeChange = (val: number) => {
    pagination.size = val
    fetchList()
  }

  const handleCurrentChange = (val: number) => {
    pagination.current = val
    fetchList()
  }
</script>

<style scoped lang="scss">
  .account-page {
    .card-title {
      font-weight: 600;
      color: var(--art-text-gray-800);
    }
    .settings {
      padding: 12px;
      min-height: 160px;
    }
    .env-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 12px 0 12px;
    }
    .env-grid {
      padding: 12px;
    }
    .env-left {
      color: var(--art-text-gray-700);
    }
  }
</style>

