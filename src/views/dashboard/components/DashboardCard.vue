<template>
  <ElCard shadow="hover" class="dashboard-card">
    <template #header>
      <div class="card-header">
        <div class="title-area">
          <span class="title">{{ title }}</span>
          <ElTooltip v-if="tooltip" :content="tooltip" placement="top">
            <ElIcon class="ml-1 cursor-pointer text-gray-400"><InfoFilled /></ElIcon>
          </ElTooltip>
        </div>
        <div class="extra">
          <slot name="extra"></slot>
        </div>
      </div>
    </template>
    <div class="card-content" v-loading="loading" :style="{ height: contentHeight }">
      <slot></slot>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ElCard, ElTooltip, ElIcon } from 'element-plus'
  import { InfoFilled } from '@element-plus/icons-vue'

  const props = withDefaults(
    defineProps<{
      title: string
      tooltip?: string
      loading?: boolean
      height?: string | number
    }>(),
    {
      loading: false,
      height: 'auto'
    }
  )

  const contentHeight = computed(() => {
    if (typeof props.height === 'number') {
      return `${props.height}px`
    }
    return props.height
  })
</script>

<style scoped lang="scss">
  .dashboard-card {
    margin-bottom: 16px;
    border-radius: 12px;
    border: none;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    }

    :deep(.el-card__header) {
      padding: 16px 24px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-card__body) {
      padding: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-area {
        display: flex;
        align-items: center;

        .title {
          font-weight: 600;
          font-size: 16px;
          color: var(--el-text-color-primary);
        }

        .ml-1 {
          margin-left: 4px;
        }
      }

      .extra {
        display: flex;
        align-items: center;
      }
    }

    .card-content {
      width: 100%;
      position: relative;
    }
  }
</style>
