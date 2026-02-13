<template>
  <SectionTitle :title="$t('setting.tenantScope.title')" />
  <div class="setting-box-wrap">
    <div
      class="setting-item"
      v-for="(item, index) in tenantScopeOptions"
      :key="item.value"
      @click="handleChange(item.value)"
    >
      <div class="box flex-center" :class="{ 'is-active': item.value === tenantScope }">
        <el-icon size="20">
          <component :is="item.icon" />
        </el-icon>
      </div>
      <p class="name">{{ $t(`setting.tenantScope.list[${index}]`) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import SectionTitle from './SectionTitle.vue'
  import { useSettingStore } from '@/store/modules/setting'
  import { storeToRefs } from 'pinia'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import { User, Files, Lock } from '@element-plus/icons-vue'

  const { t } = useI18n()
  const settingStore = useSettingStore()
  const { tenantScope } = storeToRefs(settingStore)

  const tenantScopeOptions = computed(() => [
    { value: 'current', icon: User },
    { value: 'all', icon: Files },
    { value: 'zero', icon: Lock }
  ])

  const handleChange = (value: string) => {
    if (tenantScope.value === value) return

    settingStore.tenantScope = value
    ElMessage.success(t('setting.actions.switchSuccess') || '切换成功')
  }
</script>

<style lang="scss" scoped>
  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
</style>
