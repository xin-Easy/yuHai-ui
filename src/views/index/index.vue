<!-- 布局容器 -->
<template>
  <div class="app-layout">
    <aside id="app-sidebar">
      <SidebarMenu />
    </aside>

    <main id="app-main">
      <div id="app-header">
        <HeaderBar />
      </div>
      <div id="app-content">
        <PageContent />
      </div>
    </main>

    <div id="app-global">
      <GlobalComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'AppLayout' })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
