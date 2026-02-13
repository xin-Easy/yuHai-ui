<template>
  <ElRow :gutter="16">
    <ElCol :xs="24" :sm="12" :md="8">
      <WordCloudChart />
    </ElCol>
    <ElCol :xs="24" :sm="24" :md="16">
      <GeoDistributionChart />
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { ElRow, ElCol } from 'element-plus'
  import WordCloudChart from './WordCloudChart.vue'
  import GeoDistributionChart from './GeoDistributionChart.vue'
</script>
