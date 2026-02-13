<template>
  <DashboardCard :title="t('dashboard.heatmap.title')" :loading="loading">
    <div class="chart-wrapper">
      <div ref="chartRef" class="chart-container"></div>
    </div>
  </DashboardCard>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import DashboardCard from './DashboardCard.vue'
  import { getHeatmap } from '@/api/dashboard'
  import { useChart } from '@/hooks/core/useChart'

  const { t } = useI18n()
  const { chartRef, initChart } = useChart()
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getHeatmap()
      if (!res || !res.items) {
        return
      }
      // Using Line Chart for 24h distribution
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: res.items.map((i) => i.x) },
        yAxis: {
          type: 'value',
          name: t('dashboard.heatmap.activity')
        },
        series: [
          {
            name: t('dashboard.heatmap.activity'),
            type: 'line',
            smooth: true,
            data: res.items.map((i) => i.y),
            areaStyle: { opacity: 0.1 },
            itemStyle: { color: '#E6A23C' }
          }
        ]
      }
      initChart(option as any)
    } catch (error) {
      console.error(error)
      ElMessage.error(t('dashboard.heatmap.fetchError'))
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style scoped lang="scss">
  .chart-wrapper {
    width: 100%;
    height: 300px;
  }

  .chart-container {
    width: 100%;
    height: 100%;
  }
</style>
