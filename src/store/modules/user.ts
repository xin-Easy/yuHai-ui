/**
 * 用户偏好设置管理模块
 *
 * 提供用户偏好相关的状态管理
 *
 * ## 主要功能
 *
 * - 语言设置
 * - 搜索历史记录
 *
 * ## 使用场景
 *
 * - 多语言切换
 * - 搜索历史管理
 *
 * ## 持久化
 *
 * - 使用 localStorage 存储
 * - 存储键：user
 *
 * @module store/modules/user
 * @author xingguang
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LanguageEnum } from '@/enums/appEnum'
import { router } from '@/router'
import { useSettingStore } from './setting'
import { useWorktabStore } from './worktab'
import { AppRouteRecord } from '@/types/router'
import { setPageTitle } from '@/utils/router'

/**
 * 用户偏好设置管理
 * 管理语言设置、搜索历史等
 */
export const useUserStore = defineStore(
  'userStore',
  () => {
    // 语言设置
    const language = ref(LanguageEnum.ZH)

    // 搜索历史记录
    const searchHistory = ref<AppRouteRecord[]>([])

    // 计算属性：获取设置状态
    const getSettingState = computed(() => useSettingStore().$state)
    // 计算属性：获取工作台状态
    const getWorktabState = computed(() => useWorktabStore().$state)

    /**
     * 设置语言
     * @param lang 语言枚举值
     */
    const setLanguage = (lang: LanguageEnum) => {
      setPageTitle(router.currentRoute.value)
      language.value = lang
    }

    /**
     * 设置搜索历史
     * @param list 搜索历史列表
     */
    const setSearchHistory = (list: AppRouteRecord[]) => {
      searchHistory.value = list
    }

    return {
      language,
      searchHistory,
      getSettingState,
      getWorktabState,
      setLanguage,
      setSearchHistory
    }
  },
  {
    persist: true
  }
)
