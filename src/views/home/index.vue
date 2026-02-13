<template>
  <div class="home-container p-6 min-h-full">
    <!-- Welcome Header -->
    <div class="mb-8 animate-fade-in-up">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {{ greeting }}, {{ '老板' }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400">
            {{ t('common.welcomeBack') }} | {{ currentDate }}
          </p>
        </div>
        <div class="hidden md:block">
          <img
            src="@/assets/images/user/avatar.svg"
            class="w-16 h-16 rounded-full border-4 border-white shadow-lg"
            alt="Avatar"
          />
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <el-row :gutter="24">
      <!-- Left Column: Quick Actions & Status -->
      <el-col :xs="24" :lg="16" class="space-y-6">
        <!-- Hero Card - Quick Start -->
        <el-card
          shadow="hover"
          class="border-none bg-white dark:bg-gray-800 text-gray-800 dark:text-white relative overflow-hidden group cursor-pointer transition-all hover:shadow-xl"
          :body-style="{ padding: '0' }"
          @click="router.push('/core/agent-start')"
        >
          <div class="p-8 relative z-10">
            <div class="flex items-start justify-between">
              <div>
                <div class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg inline-block mb-4">
                  <el-icon :size="24" class="text-blue-600 dark:text-blue-400"
                    ><VideoPlay
                  /></el-icon>
                </div>
                <h2 class="text-2xl font-bold mb-2">{{ t('core.agentStart.title') }}</h2>
                <p class="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  {{
                    t('core.agentStart.description') ||
                    '快速启动一个新的自动化代理任务，支持多平台采集与互动。'
                  }}
                </p>
                <el-button type="primary" class="font-medium">
                  {{ t('core.agentStart.startTask') }}
                  <el-icon class="ml-2"><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <!-- Decorative Background Circles -->
          <div
            class="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/5 dark:bg-white/5 rounded-full blur-3xl group-hover:bg-blue-500/10 dark:group-hover:bg-white/10 transition-all duration-500"
          ></div>
          <div
            class="absolute right-20 -top-10 w-32 h-32 bg-blue-500/5 dark:bg-white/5 rounded-full blur-2xl group-hover:bg-blue-500/10 dark:group-hover:bg-white/10 transition-all duration-500 delay-75"
          ></div>
        </el-card>

        <!-- Shortcut Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <el-card
            v-for="item in shortcuts"
            :key="item.path"
            shadow="hover"
            class="border-none cursor-pointer hover:-translate-y-1 transition-transform duration-300"
            :body-style="{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }"
            @click="handleShortcut(item)"
          >
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300"
              :class="item.bgClass"
            >
              <el-icon :size="24" :class="item.iconClass"><component :is="item.icon" /></el-icon>
            </div>
            <span class="font-medium text-gray-700 dark:text-gray-200">{{ item.title }}</span>
          </el-card>
        </div>

        <!-- Recent Activity / System Status -->
        <el-card shadow="hover" class="border-none">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium text-lg">{{
                t('dashboard.overview.title') || '系统概览'
              }}</span>
              <el-button text type="primary" @click="router.push('/dashboard/console')">
                {{ t('common.viewMore') || '查看更多' }}
              </el-button>
            </div>
          </template>
          <OverviewCards />
        </el-card>
      </el-col>

      <!-- Right Column: Info & Calendar -->
      <el-col :xs="24" :lg="8" class="space-y-6 mt-6 lg:mt-0">
        <!-- System Info Card -->
        <el-card
          shadow="hover"
          class="border-none bg-white dark:bg-gray-800 text-gray-800 dark:text-white relative overflow-hidden"
        >
          <div class="relative z-10">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
              <el-icon><Monitor /></el-icon>
              系统状态
            </h3>
            <div class="space-y-4">
              <div
                class="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2"
              >
                <span class="text-gray-500 dark:text-gray-400">核心版本</span>
                <span class="font-mono text-green-600 dark:text-green-400">v0.1.1</span>
              </div>
              <div
                class="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2"
              >
                <span class="text-gray-500 dark:text-gray-400">运行状态</span>
                <span class="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span class="relative flex h-2 w-2">
                    <span
                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                    ></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Running
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500 dark:text-gray-400">上次更新</span>
                <span class="text-gray-600 dark:text-gray-300">2026-01-29</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- Quick Calendar/Schedule -->
        <el-card shadow="hover" class="border-none">
          <el-calendar v-model="calendarValue" class="custom-calendar">
            <template #header="{ date }">
              <div class="flex items-center justify-between w-full px-2">
                <span class="text-base font-bold text-gray-800 dark:text-gray-100">{{ date }}</span>
                <div class="flex gap-1">
                  <!-- Optional: Add manual controls if needed, but simple display is often enough -->
                </div>
              </div>
            </template>
          </el-calendar>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import {
    VideoPlay,
    ArrowRight,
    DataLine,
    User,
    Setting,
    Monitor,
    Odometer
  } from '@element-plus/icons-vue'
  import OverviewCards from '../dashboard/components/OverviewCards.vue'

  defineOptions({ name: 'HomePage' })

  const router = useRouter()
  const { t } = useI18n()
  const calendarValue = ref(new Date())

  // Greeting Logic
  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了'
    if (hour < 9) return '早上好'
    if (hour < 12) return '上午好'
    if (hour < 14) return '中午好'
    if (hour < 17) return '下午好'
    if (hour < 19) return '傍晚好'
    return '晚上好'
  })

  const currentDate = computed(() => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(new Date())
  })

  // Shortcuts Data
  const shortcuts = [
    {
      title: '数据仪表盘',
      path: '/dashboard/console',
      icon: Odometer,
      bgClass: 'bg-purple-100 dark:bg-purple-900/30',
      iconClass: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: '账号管理',
      path: '/core/account',
      icon: User,
      bgClass: 'bg-orange-100 dark:bg-orange-900/30',
      iconClass: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: '系统配置',
      path: '/core/system-config',
      icon: Setting,
      bgClass: 'bg-teal-100 dark:bg-teal-900/30',
      iconClass: 'text-teal-600 dark:text-teal-400'
    },
    {
      title: '日志监控',
      path: '/core/system-log', // Assuming this route exists or similar
      icon: DataLine,
      bgClass: 'bg-pink-100 dark:bg-pink-900/30',
      iconClass: 'text-pink-600 dark:text-pink-400'
    }
  ]

  const handleShortcut = (item: any) => {
    if (item.path) {
      router.push(item.path)
    }
  }
</script>

<style scoped lang="scss">
  .home-container {
    background-color: var(--default-bg-color);
  }

  .custom-calendar {
    --el-calendar-border: none;
    --el-calendar-header-border-bottom: none;

    :deep(.el-calendar__header) {
      padding: 16px 0 8px 0;
    }
    :deep(.el-calendar__title) {
      width: 100%;
    }
    :deep(.el-calendar__body) {
      padding: 0;
    }
    :deep(.el-calendar-table thead th) {
      padding: 12px 0;
      color: var(--el-text-color-secondary);
      font-weight: normal;
      font-size: 0.85rem;
    }
    :deep(.el-calendar-table td) {
      border: none;
      padding: 4px;
    }
    :deep(.el-calendar-table .el-calendar-day) {
      height: 32px;
      width: 32px;
      margin: 0 auto;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 0.9rem;
      
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
    }
    :deep(.el-calendar-table td.is-selected .el-calendar-day) {
      background-color: var(--el-color-primary);
      color: white;
      box-shadow: 0 4px 12px var(--el-color-primary-light-5);
      font-weight: 600;
    }
    :deep(.el-calendar-table td.is-today .el-calendar-day) {
      color: var(--el-color-primary);
      font-weight: 600;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 3px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: currentColor;
      }
    }
    // Fix: When today is selected, dot should be white
    :deep(.el-calendar-table td.is-selected.is-today .el-calendar-day) {
      color: white;
      &::after {
        background-color: white;
      }
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
