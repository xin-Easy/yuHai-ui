<template>
  <div class="dashboard-container">
    <OverviewCards />
    <HeatmapChart />
    <DistributionCharts />
    <AnalysisCharts />
    <RankList />
  </div>
</template>

<script setup lang="ts">
  import OverviewCards from './components/OverviewCards.vue'
  import HeatmapChart from './components/HeatmapChart.vue'
  import DistributionCharts from './components/DistributionCharts.vue'
  import RankList from './components/RankList.vue'
  import AnalysisCharts from './components/AnalysisCharts.vue'

  defineOptions({
    name: 'Dashboard'
  })
</script>

<style scoped lang="scss">
  .dashboard-container {
    padding: 16px;
    background-color: var(--el-bg-color-page);
    min-height: 100vh;
  }
</style>
