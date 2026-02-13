<template>
  <div class="exception-container">
    <el-result icon="warning" title="403" sub-title="抱歉，您无权访问该页面">
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const goHome = () => {
    router.push('/')
  }
</script>

<style scoped>
  .exception-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>
