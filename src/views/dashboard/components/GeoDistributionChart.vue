<template>
  <DashboardCard :title="t('dashboard.geo.title')" :loading="loading">
    <ArtMapChart
      height="300px"
      :map-data="geoData"
      :loading="loading"
      :show-scatter="false"
      :show-labels="false"
    />
  </DashboardCard>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import DashboardCard from './DashboardCard.vue'
  import { getGeoDistribution } from '@/api/dashboard'
  import ArtMapChart from '@/components/core/charts/map-chart/index.vue'

  const { t } = useI18n()
  const loading = ref(false)
  const geoData = ref<any[]>([])

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getGeoDistribution()
      if (Array.isArray(res)) {
        geoData.value = res
      } else if (res && res.items) {
        geoData.value = res.items
      }
    } catch (error) {
      console.error(error)
      ElMessage.error(t('dashboard.geo.fetchError'))
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style scoped lang="scss"></style>
