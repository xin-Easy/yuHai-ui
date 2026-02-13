<template>
  <DashboardCard :title="t('dashboard.taskStatus.title')" :loading="loading">
    <div ref="chartRef" class="chart-container"></div>
  </DashboardCard>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import DashboardCard from './DashboardCard.vue'
  import { getTaskStatusDistribution } from '@/api/dashboard'
  import { useChart } from '@/hooks/core/useChart'

  const { t } = useI18n()
  const { chartRef, initChart } = useChart()
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getTaskStatusDistribution()
      const option = {
        tooltip: {
          trigger: 'item' as const
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [
          {
            name: t('dashboard.taskStatus.seriesName'),
            type: 'pie' as const,
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: res.items.map((item) => ({
              value: item.value,
              name: item.name
            }))
          }
        ]
      }
      initChart(option as any)
    } catch (error) {
      console.error(error)
      ElMessage.error(t('dashboard.taskStatus.fetchError'))
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style scoped lang="scss">
  .chart-container {
    height: 300px;
  }
</style>
