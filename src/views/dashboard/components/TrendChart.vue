<template>
  <DashboardCard :title="t('dashboard.trend.title')" :loading="loading">
    <template #extra>
      <ElRadioGroup v-model="days" size="small" @change="fetchData">
        <ElRadioButton :label="7">{{ t('dashboard.trend.days7') }}</ElRadioButton>
        <ElRadioButton :label="30">{{ t('dashboard.trend.days30') }}</ElRadioButton>
      </ElRadioGroup>
    </template>
    <div ref="chartRef" class="chart-container"></div>
  </DashboardCard>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElRadioGroup, ElRadioButton, ElMessage } from 'element-plus'
  import DashboardCard from './DashboardCard.vue'
  import { getNoteTrends } from '@/api/dashboard'
  import { useChart } from '@/hooks/core/useChart'

  const { t } = useI18n()
  const { chartRef, initChart, getTooltipStyle } = useChart()
  const loading = ref(false)
  const days = ref(30)

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getNoteTrends(days.value)
      const dates = res.items.map((item) => item.date)
      const values = res.items.map((item) => item.value)

      const option = {
        tooltip: getTooltipStyle('axis'),
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category' as const,
          boundaryGap: false,
          data: dates
        },
        yAxis: {
          type: 'value' as const,
          name: t('dashboard.trend.yAxisName')
        },
        series: [
          {
            name: t('dashboard.trend.seriesName'),
            type: 'line' as const,
            smooth: true,
            data: values,
            areaStyle: {
              opacity: 0.1
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      }
      initChart(option)
    } catch (error) {
      console.error(error)
      ElMessage.error(t('dashboard.trend.fetchError'))
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
