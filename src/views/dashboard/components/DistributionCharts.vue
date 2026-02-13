<template>
  <ElRow :gutter="16">
    <ElCol :xs="24" :sm="12">
      <NoteTypePieChart />
    </ElCol>
    <ElCol :xs="24" :sm="12">
      <TaskStatusPieChart />
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { ElRow, ElCol } from 'element-plus'
  import NoteTypePieChart from './NoteTypePieChart.vue'
  import TaskStatusPieChart from './TaskStatusPieChart.vue'
</script>
