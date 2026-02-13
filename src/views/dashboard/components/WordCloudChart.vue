<template>
  <DashboardCard :title="t('dashboard.wordCloud.title')" :loading="loading">
    <div class="chart-wrapper">
      <div ref="chartRef" class="chart-container"></div>
    </div>
  </DashboardCard>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import 'echarts-wordcloud'
  import DashboardCard from './DashboardCard.vue'
  import { getWordCloud } from '@/api/dashboard'
  import { useChart } from '@/hooks/core/useChart'

  const { t } = useI18n()
  const { chartRef, initChart } = useChart()
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getWordCloud()
      if (!res || !res.items) {
        console.warn('Word cloud data invalid:', res)
        return
      }

      const option: any = {
        tooltip: {
          show: true
        },
        series: [
          {
            type: 'wordCloud',
            shape: 'circle',
            left: 'center',
            top: 'center',
            width: '100%',
            height: '100%',
            right: null,
            bottom: null,
            sizeRange: [12, 60],
            rotationRange: [-90, 90],
            rotationStep: 45,
            gridSize: 8,
            drawOutOfBound: false,
            layoutAnimation: true,
            textStyle: {
              fontFamily: 'sans-serif',
              fontWeight: 'bold',
              color: function () {
                return (
                  'rgb(' +
                  [
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160)
                  ].join(',') +
                  ')'
                )
              }
            },
            emphasis: {
              focus: 'self',
              textStyle: {
                textShadowBlur: 10,
                textShadowColor: '#333'
              }
            },
            data: res.items.map((item) => ({
              name: item.text,
              value: item.value
            }))
          }
        ]
      }
      initChart(option)
    } catch (error) {
      console.error('Word cloud error:', error)
      ElMessage.error(t('dashboard.wordCloud.fetchError'))
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
