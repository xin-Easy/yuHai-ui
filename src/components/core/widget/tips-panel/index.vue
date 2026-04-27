<template>
  <div class="art-tips-panel">
    <div class="tips-header">
      <i class="ri-alert-line"></i>
      <span class="title-text">{{ title || '温馨提示' }}</span>
    </div>
    <div class="tips-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title?: string
  }>()
</script>

<style scoped lang="scss">
  .art-tips-panel {
    padding: 12px 16px;
    margin-top: 15px;
    background-color: var(--el-color-warning-light-9);
    border: 1px solid var(--el-color-warning-light-8);
    border-radius: 6px;

    .tips-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-color-warning);

      i {
        margin-right: 6px;
        font-size: 16px;
      }
    }

    .tips-content {
      font-size: 13px;
      line-height: 1.6;
      color: var(--art-text-gray-600);

      :deep(p) {
        margin: 4px 0;
      }

      :deep(ul) {
        padding-left: 20px;
        margin: 4px 0;
        list-style-type: disc;
      }

      :deep(li) {
        margin: 2px 0;
      }
    }
  }
</style>
