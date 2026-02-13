<template>
  <ElRow :gutter="16">
    <ElCol v-for="(card, index) in cards" :key="index" :xs="24" :sm="12" :md="6">
      <DashboardCard :title="card.title">
        <template #extra>
          <ElTag :type="getTrendType(card.trend_type)" size="small" effect="plain">
            {{ getTrendLabel(card.trend_type) }}
          </ElTag>
        </template>
        <div class="card-content">
          <div class="card-value">
            <span class="value">{{ card.value }}</span>
            <span class="unit">{{ card.unit }}</span>
          </div>
          <div v-if="card.trend !== null" class="card-trend">
            <span :class="['trend-value', card.trend_type]">
              {{ formatTrend(card.trend) }}
            </span>
            <span class="trend-label">{{ t('dashboard.overview.compareYesterday') }}</span>
          </div>
        </div>
      </DashboardCard>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElRow, ElCol, ElTag, ElMessage } from 'element-plus'
  import DashboardCard from './DashboardCard.vue'
  import { getOverview, type OverviewCard } from '@/api/dashboard'

  const { t } = useI18n()
  const cards = ref<OverviewCard[]>([])
  const loading = ref(false)

  const getTrendType = (type: string) => {
    switch (type) {
      case 'up':
        return 'success'
      case 'down':
        return 'danger'
      default:
        return 'info'
    }
  }

  const getTrendLabel = (type: string) => {
    switch (type) {
      case 'up':
        return t('dashboard.overview.up')
      case 'down':
        return t('dashboard.overview.down')
      default:
        return t('dashboard.overview.flat')
    }
  }

  const formatTrend = (trend: number | null) => {
    if (trend === null) return ''
    return `${(trend * 100).toFixed(1)}%`
  }

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getOverview()
      cards.value = res.cards

      // Force update the 3rd card (index 2) to show "Total Comments"
      if (cards.value.length > 2) {
        cards.value[2].title = t('dashboard.overview.totalComments')
        cards.value[2].unit = t('dashboard.overview.commentsUnit')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error(t('dashboard.overview.fetchError'))
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style scoped lang="scss">
  .card-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .card-value {
      font-size: 24px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;

      .unit {
        font-size: 14px;
        font-weight: normal;
        color: var(--el-text-color-secondary);
        margin-left: 4px;
      }
    }

    .card-trend {
      display: flex;
      align-items: center;
      font-size: 12px;

      .trend-value {
        font-weight: bold;
        margin-right: 4px;

        &.up {
          color: var(--el-color-success);
        }

        &.down {
          color: var(--el-color-danger);
        }

        &.flat {
          color: var(--el-text-color-secondary);
        }
      }

      .trend-label {
        color: var(--el-text-color-secondary);
      }
    }
  }
</style>
