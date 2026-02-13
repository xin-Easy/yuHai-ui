<!-- 顶部栏 -->
<template>
  <div
    class="w-full bg-[var(--default-bg-color)]"
    :class="[
      tabStyle === 'tab-card' || tabStyle === 'tab-google' ? 'mb-5 max-sm:mb-3 !bg-box' : ''
    ]"
  >
    <div
      class="relative box-border flex-b h-15 leading-15 select-none"
      :class="[
        tabStyle === 'tab-card' || tabStyle === 'tab-google'
          ? 'border-b border-[var(--art-card-border)]'
          : ''
      ]"
    >
      <div class="flex-c flex-1 min-w-0 leading-15" style="display: flex">
        <!-- 系统信息  -->
        <div class="flex-c c-p" @click="toHome" v-if="isTopMenu">
          <Logo class="pl-4.5" />
          <p v-if="width >= 1400" class="my-0 mx-2 ml-2 text-lg">{{ AppConfig.systemInfo.name }}</p>
        </div>

        <Logo class="!hidden pl-3.5 overflow-hidden align-[-0.15em] fill-current" @click="toHome" />

        <!-- 菜单按钮 -->
        <IconButton
          v-if="isLeftMenu && shouldShowMenuButton"
          icon="ri:menu-2-fill"
          class="ml-3 max-sm:ml-[7px]"
          @click="visibleMenu"
        />

        <!-- 刷新按钮 -->
        <IconButton
          v-if="shouldShowRefreshButton"
          icon="ri:refresh-line"
          class="!ml-3 refresh-btn max-sm:!hidden"
          :style="{ marginLeft: !isLeftMenu ? '10px' : '0' }"
          @click="reload"
        />

        <!-- 面包屑 -->
        <Breadcrumb
          v-if="(shouldShowBreadcrumb && isLeftMenu) || (shouldShowBreadcrumb && isDualMenu)"
        />

        <!-- 顶部菜单 -->
        <HorizontalMenu v-if="isTopMenu" :list="menuList" />

        <!-- 混合菜单-顶部 -->
        <MixedMenu v-if="isTopLeftMenu" :list="menuList" />
      </div>

      <div class="flex-c gap-2.5">
        <!-- 搜索 -->
        <div
          v-if="shouldShowGlobalSearch"
          class="flex-cb w-40 h-9 px-2.5 c-p border border-g-400 rounded-custom-sm max-md:!hidden"
          @click="openSearchDialog"
        >
          <div class="flex-c">
            <SvgIcon icon="ri:search-line" class="text-sm text-g-500" />
            <span class="ml-1 text-xs font-normal text-g-500">{{ $t('topBar.search.title') }}</span>
          </div>
          <div class="flex-c h-5 px-1.5 text-g-500/80 border border-g-400 rounded">
            <SvgIcon v-if="isWindows" icon="vaadin:ctrl-a" class="text-sm" />
            <SvgIcon v-else icon="ri:command-fill" class="text-xs" />
            <span class="ml-0.5 text-xs">k</span>
          </div>
        </div>

        <!-- 全屏按钮 -->
        <IconButton
          v-if="shouldShowFullscreen"
          :icon="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'"
          :class="[!isFullscreen ? 'full-screen-btn' : 'exit-full-screen-btn', 'ml-3']"
          class="max-md:!hidden"
          @click="toggleFullScreen"
        />

        <!-- 国际化按钮 -->
        <ElDropdown
          @command="changeLanguage"
          popper-class="langDropDownStyle"
          v-if="shouldShowLanguage"
        >
          <IconButton icon="ri:translate-2" class="language-btn text-[19px]" />
          <template #dropdown>
            <ElDropdownMenu>
              <div v-for="item in languageOptions" :key="item.value" class="lang-btn-item">
                <ElDropdownItem
                  :command="item.value"
                  :class="{ 'is-selected': locale === item.value }"
                >
                  <span class="menu-txt">{{ item.label }}</span>
                  <SvgIcon icon="ri:check-fill" v-if="locale === item.value" />
                </ElDropdownItem>
              </div>
            </ElDropdownMenu>
          </template>
        </ElDropdown>

        <IconButton
          v-if="shouldShowThemeToggle"
          :icon="themeToggleIcon"
          class="theme-toggle-btn"
          @click="toggleTheme"
        />

        <div
          class="proxy-manager-btn flex-cc h-9 px-3 cursor-pointer border border-g-200 hover:border-g-400 hover:bg-g-50 text-g-600 hover:text-g-900 rounded-custom-sm transition-all duration-300"
          @click="openProxyManager"
        >
          <span class="text-sm select-none">代理管理</span>
        </div>

        <!-- 设置按钮 -->
        <div v-if="shouldShowSettings">
          <ElPopover :visible="showSettingGuide" placement="bottom-start" :width="190" :offset="0">
            <template #reference>
              <div class="flex-cc">
                <IconButton icon="ri:settings-line" class="setting-btn" @click="openSetting" />
              </div>
            </template>
            <template #default>
              <p
                >{{ $t('topBar.guide.title')
                }}<span :style="{ color: systemThemeColor }"> {{ $t('topBar.guide.theme') }} </span
                >、 <span :style="{ color: systemThemeColor }"> {{ $t('topBar.guide.menu') }} </span
                >{{ $t('topBar.guide.description') }}
              </p>
            </template>
          </ElPopover>
        </div>

      </div>
    </div>

    <!-- 标签页 -->
    <WorkTab />

    <ElDialog
      v-model="proxyManagerVisible"
      :title="$t('core.account.proxy.title')"
      width="980px"
      destroy-on-close
    >
      <TipsPanel class="mb-4" :title="$t('core.account.proxy.tips.title')">
        <ul>
          <li>
            <strong>{{ $t('core.account.proxy.tips.exclusiveMode') }}</strong
            >：{{ $t('core.account.proxy.tips.exclusiveModeDesc') }}
          </li>
          <li>
            <strong>{{ $t('core.account.proxy.tips.autoAllocation') }}</strong
            >：{{ $t('core.account.proxy.tips.autoAllocationDesc') }}
          </li>
          <li>
            <strong>{{ $t('core.account.proxy.tips.accountProtection') }}</strong
            >：{{ $t('core.account.proxy.tips.accountProtectionDesc') }}
          </li>
          <li>{{ $t('core.account.proxy.tips.testingDisclaimer') }}</li>
          <li>{{ $t('core.account.proxy.tips.helpWanted') }}</li>
        </ul>
      </TipsPanel>
      <div class="flex items-center justify-between mb-3">
        <ElInput
          v-model="proxySearch"
          :placeholder="$t('core.account.proxy.searchPlaceholder')"
          size="small"
          class="w-60"
          @keyup.enter="handleProxySearch"
        />
        <div class="flex items-center gap-2">
          <ElButton size="small" @click="handleProxySearch">{{
            $t('core.account.proxy.search')
          }}</ElButton>
          <ElButton type="primary" size="small" @click="openProxyDialog()">{{
            $t('core.account.proxy.add')
          }}</ElButton>
        </div>
      </div>
      <Table
        :loading="proxyLoading"
        :data="proxyTableData"
        :columns="proxyColumns as any"
        :pagination="proxyPagination"
        @pagination:size-change="handleProxySizeChange"
        @pagination:current-change="handleProxyCurrentChange"
      />
    </ElDialog>

    <ElDialog v-model="proxyDialogVisible" :title="proxyDialogTitle" width="520px" destroy-on-close>
      <ElForm ref="proxyFormRef" :model="proxyForm" :rules="proxyRules" label-width="80px">
        <ElFormItem :label="$t('core.account.proxy.form.name')" prop="name">
          <ElInput v-model="proxyForm.name" />
        </ElFormItem>
        <ElFormItem :label="$t('core.account.proxy.form.protocol')" prop="protocol">
          <ElSelect v-model="proxyForm.protocol">
            <ElOption label="HTTP" value="HTTP" />
            <ElOption label="HTTPS" value="HTTPS" />
            <ElOption label="SOCKS5" value="SOCKS5" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="$t('core.account.proxy.form.host')" prop="host">
          <ElInput v-model="proxyForm.host" />
        </ElFormItem>
        <ElFormItem :label="$t('core.account.proxy.form.port')" prop="port">
          <ElInputNumber v-model="proxyForm.port" :min="1" :max="65535" class="w-full" />
        </ElFormItem>
        <ElFormItem :label="$t('core.account.proxy.form.username')">
          <ElInput v-model="proxyForm.username" />
        </ElFormItem>
        <ElFormItem :label="$t('core.account.proxy.form.password')">
          <ElInput v-model="proxyForm.password" type="password" show-password />
        </ElFormItem>
        <ElFormItem :label="$t('core.account.proxy.form.status')">
          <ElSelect v-model="proxyForm.status">
            <ElOption :label="$t('core.account.proxy.statusEnabled')" :value="1" />
            <ElOption :label="$t('core.account.proxy.statusDisabled')" :value="0" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="$t('core.account.proxy.form.description')">
          <ElInput v-model="proxyForm.description" type="textarea" :rows="3" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="proxyDialogVisible = false">{{ $t('core.account.cancel') }}</ElButton>
        <ElButton type="primary" :loading="proxySubmitting" @click="handleProxySubmit">{{
          $t('core.account.confirm')
        }}</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useFullscreen, useWindowSize } from '@vueuse/core'
  import { ElMessage, ElMessageBox, ElTag, ElLink } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { LanguageEnum, MenuTypeEnum, SystemThemeEnum } from '@/enums/appEnum'
  import { useSettingStore } from '@/store/modules/setting'
  import { useUserStore } from '@/store/modules/user'
  import { useMenuStore } from '@/store/modules/menu'
  import AppConfig from '@/config'
  import { languageOptions } from '@/locales'
  import { mittBus } from '@/utils/sys'
  import { useCommon } from '@/hooks/core/useCommon'
  import { useHeaderBar } from '@/hooks/core/useHeaderBar'
  import { useTheme } from '@/hooks/core/useTheme'
  import TipsPanel from '@/components/core/widget/tips-panel/index.vue'
  import {
    getProxyList,
    addProxy,
    updateProxy,
    deleteProxy,
    type ProxyItem,
    type ProxyProtocol
  } from '@/api/automation/proxy'

  defineOptions({ name: 'HeaderBar' })

  // 检测操作系统类型
  const isWindows = navigator.userAgent.includes('Windows')

  const router = useRouter()
  const { locale, t } = useI18n()
  const { width } = useWindowSize()

  const settingStore = useSettingStore()
  const userStore = useUserStore()
  const menuStore = useMenuStore()

  // 顶部栏功能配置
  const {
    shouldShowMenuButton,
    shouldShowRefreshButton,
    shouldShowBreadcrumb,
    shouldShowGlobalSearch,
    shouldShowFullscreen,
    shouldShowLanguage,
    shouldShowSettings,
    shouldShowThemeToggle
  } = useHeaderBar()

  const { menuOpen, systemThemeColor, showSettingGuide, menuType, tabStyle, systemThemeType } =
    storeToRefs(settingStore)

  const { language } = storeToRefs(userStore)
  const { menuList } = storeToRefs(menuStore)

  const proxyLoading = ref(false)
  const proxyTableData = ref<ProxyItem[]>([])
  const proxyPagination = reactive({ current: 1, size: 10, total: 0 })
  const proxySearch = ref('')
  const proxyManagerVisible = ref(false)
  const proxyDialogVisible = ref(false)
  const proxySubmitting = ref(false)
  const proxyMode = ref<'create' | 'edit'>('create')
  const proxyFormRef = ref<FormInstance>()
  const proxyForm = reactive({
    id: 0,
    name: '',
    protocol: 'SOCKS5' as ProxyProtocol,
    host: '',
    port: 1080,
    username: '',
    password: '',
    status: 1,
    description: ''
  })

  const proxyRules: FormRules = {
    name: [{ required: true, message: t('core.account.proxy.rules.name'), trigger: 'blur' }],
    protocol: [
      { required: true, message: t('core.account.proxy.rules.protocol'), trigger: 'change' }
    ],
    host: [{ required: true, message: t('core.account.proxy.rules.host'), trigger: 'blur' }],
    port: [{ required: true, message: t('core.account.proxy.rules.port'), trigger: 'change' }]
  }

  const proxyDialogTitle = computed(() =>
    proxyMode.value === 'create'
      ? t('core.account.proxy.createTitle')
      : t('core.account.proxy.editTitle')
  )

  // 菜单类型判断
  const isLeftMenu = computed(() => menuType.value === MenuTypeEnum.LEFT)
  const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU)
  const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP)
  const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT)

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

  const { switchThemeStyles } = useTheme()
  const themeToggleIcon = computed(() =>
    systemThemeType.value === SystemThemeEnum.DARK ? 'ri:sun-line' : 'ri:moon-line'
  )

  onMounted(() => {
    initLanguage()
  })

  /**
   * 切换全屏状态
   */
  const toggleFullScreen = (): void => {
    toggleFullscreen()
  }

  const toggleTheme = (): void => {
    const nextTheme =
      systemThemeType.value === SystemThemeEnum.DARK
        ? SystemThemeEnum.LIGHT
        : SystemThemeEnum.DARK
    switchThemeStyles(nextTheme)
  }

  /**
   * 切换菜单显示/隐藏状态
   */
  const visibleMenu = (): void => {
    settingStore.setMenuOpen(!menuOpen.value)
  }

  const { homePath } = useCommon()
  const { refresh } = useCommon()

  /**
   * 跳转到首页
   */
  const toHome = (): void => {
    router.push(homePath.value)
  }

  /**
   * 刷新页面
   * @param {number} time - 延迟时间，默认为0毫秒
   */
  const reload = (time: number = 0): void => {
    setTimeout(() => {
      refresh()
    }, time)
  }

  /**
   * 初始化语言设置
   */
  const initLanguage = (): void => {
    locale.value = language.value
  }

  /**
   * 切换系统语言
   * @param {LanguageEnum} lang - 目标语言类型
   */
  const changeLanguage = (lang: LanguageEnum): void => {
    if (locale.value === lang) return
    locale.value = lang
    userStore.setLanguage(lang)
    reload(50)
  }

  /**
   * 打开设置面板
   */
  const openSetting = (): void => {
    mittBus.emit('openSetting')

    // 隐藏设置引导提示
    if (showSettingGuide.value) {
      settingStore.hideSettingGuide()
    }
  }

  /**
   * 打开全局搜索对话框
   */
  const openSearchDialog = (): void => {
    mittBus.emit('openSearchDialog')
  }

  const fetchProxyList = async () => {
    proxyLoading.value = true
    try {
      const res = await getProxyList({
        page: proxyPagination.current,
        per_page: proxyPagination.size,
        search: proxySearch.value || undefined
      })
      proxyTableData.value = res.items
      proxyPagination.total = res.total
    } finally {
      proxyLoading.value = false
    }
  }

  const handleProxySearch = () => {
    proxyPagination.current = 1
    fetchProxyList()
  }

  const openProxyManager = () => {
    proxyManagerVisible.value = true
    fetchProxyList()
  }

  const resetProxyForm = () => {
    proxyForm.id = 0
    proxyForm.name = ''
    proxyForm.protocol = 'SOCKS5'
    proxyForm.host = ''
    proxyForm.port = 1080
    proxyForm.username = ''
    proxyForm.password = ''
    proxyForm.status = 1
    proxyForm.description = ''
  }

  const openProxyDialog = (row?: ProxyItem) => {
    if (row) {
      proxyMode.value = 'edit'
      proxyForm.id = row.id
      proxyForm.name = row.name
      proxyForm.protocol = row.protocol
      proxyForm.host = row.host
      proxyForm.port = row.port
      proxyForm.username = row.username || ''
      proxyForm.password = row.password || ''
      proxyForm.status = row.status ?? 1
      proxyForm.description = row.description || ''
    } else {
      proxyMode.value = 'create'
      resetProxyForm()
    }
    proxyDialogVisible.value = true
  }

  const handleProxySubmit = async () => {
    if (!proxyFormRef.value) return
    const valid = await proxyFormRef.value.validate().catch(() => false)
    if (!valid) return
    proxySubmitting.value = true
    try {
      const payload = {
        name: proxyForm.name,
        protocol: proxyForm.protocol,
        host: proxyForm.host,
        port: proxyForm.port,
        username: proxyForm.username || undefined,
        password: proxyForm.password || undefined,
        status: proxyForm.status,
        description: proxyForm.description || undefined
      }
      if (proxyMode.value === 'create') {
        await addProxy(payload)
        ElMessage.success(t('core.account.proxy.createSuccess'))
      } else {
        await updateProxy(proxyForm.id, payload)
        ElMessage.success(t('core.account.proxy.updateSuccess'))
      }
      proxyDialogVisible.value = false
      fetchProxyList()
    } finally {
      proxySubmitting.value = false
    }
  }

  const removeProxy = async (row: ProxyItem) => {
    await ElMessageBox.confirm(
      t('core.account.proxy.deletePrompt', { name: row.name }),
      t('core.account.deleteConfirm'),
      {
        confirmButtonText: t('core.account.confirm'),
        cancelButtonText: t('core.account.cancel'),
        type: 'warning'
      }
    )
    await deleteProxy(row.id)
    ElMessage.success(t('core.account.proxy.deleteSuccess'))
    fetchProxyList()
  }

  const proxyColumns = computed(() => [
    { type: 'index', label: t('table.column.index'), width: 60 },
    { prop: 'name', label: t('core.account.proxy.columns.name'), minWidth: 120 },
    { prop: 'protocol', label: t('core.account.proxy.columns.protocol'), minWidth: 90 },
    { prop: 'host', label: t('core.account.proxy.columns.host'), minWidth: 140 },
    { prop: 'port', label: t('core.account.proxy.columns.port'), width: 90 },
    { prop: 'username', label: t('core.account.proxy.columns.username'), minWidth: 120 },
    {
      prop: 'status',
      label: t('core.account.proxy.columns.status'),
      width: 90,
      formatter: (row: ProxyItem) =>
        h(ElTag, { type: row.status === 1 ? 'success' : 'info' }, () =>
          row.status === 1
            ? t('core.account.proxy.statusEnabled')
            : t('core.account.proxy.statusDisabled')
        )
    },
    { prop: 'description', label: t('core.account.proxy.columns.description'), minWidth: 160 },
    { prop: 'updated_at', label: t('core.account.proxy.columns.updatedAt'), width: 170 },
    {
      prop: 'operation',
      label: t('core.taskList.action'),
      width: 160,
      fixed: 'right' as const,
      formatter: (row: ProxyItem) =>
        h('div', [
          h(ElLink, { type: 'primary', onClick: () => openProxyDialog(row) }, () =>
            t('core.account.proxy.edit')
          ),
          h(
            ElLink,
            { style: 'margin-left: 8px', type: 'danger', onClick: () => removeProxy(row) },
            () => t('core.account.proxy.delete')
          )
        ])
    }
  ])

  const handleProxySizeChange = (val: number) => {
    proxyPagination.size = val
    fetchProxyList()
  }

  const handleProxyCurrentChange = (val: number) => {
    proxyPagination.current = val
    fetchProxyList()
  }
</script>

<style lang="scss" scoped>
  /* Custom animations */
  @keyframes rotate180 {
    0% {
      transform: rotate(0);
    }

    100% {
      transform: rotate(180deg);
    }
  }

  @keyframes shake {
    0% {
      transform: rotate(0);
    }

    25% {
      transform: rotate(-5deg);
    }

    50% {
      transform: rotate(5deg);
    }

    75% {
      transform: rotate(-5deg);
    }

    100% {
      transform: rotate(0);
    }
  }

  @keyframes expand {
    0% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.1);
    }

    100% {
      transform: scale(1);
    }
  }

  @keyframes shrink {
    0% {
      transform: scale(1);
    }

    50% {
      transform: scale(0.9);
    }

    100% {
      transform: scale(1);
    }
  }

  @keyframes moveUp {
    0% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-3px);
    }

    100% {
      transform: translateY(0);
    }
  }

  @keyframes breathing {
    0% {
      opacity: 0.4;
      transform: scale(0.9);
    }

    50% {
      opacity: 1;
      transform: scale(1.1);
    }

    100% {
      opacity: 0.4;
      transform: scale(0.9);
    }
  }

  /* Hover animation classes */
  .refresh-btn:hover :deep(.art-svg-icon) {
    animation: rotate180 0.5s;
  }

  .language-btn:hover :deep(.art-svg-icon) {
    animation: moveUp 0.4s;
  }

  .setting-btn:hover :deep(.art-svg-icon) {
    animation: rotate180 0.5s;
  }

  .full-screen-btn:hover :deep(.art-svg-icon) {
    animation: expand 0.6s forwards;
  }

  .exit-full-screen-btn:hover :deep(.art-svg-icon) {
    animation: shrink 0.6s forwards;
  }

  /* iPad breakpoint adjustments */
  @media screen and (width <= 768px) {
    .logo2 {
      display: block !important;
    }
  }

  @media screen and (width <= 640px) {
    .btn-box {
      width: 40px;
    }
  }
</style>
