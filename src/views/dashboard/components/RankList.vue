<template>
  <DashboardCard :title="t('dashboard.rank.title')" :loading="loading">
    <ElTable :data="list" style="width: 100%">
      <ElTableColumn type="index" :label="t('dashboard.rank.column.rank')" width="60" />
      <ElTableColumn :label="t('dashboard.rank.column.cover')" width="80">
        <template #default="{ row }">
          <ElImage
            :src="getNoteResourceImageUrl(row.id)"
            class="resource-image"
            fit="cover"
            :preview-src-list="[getNoteResourceImageUrl(row.id)]"
            preview-teleported
          />
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="title"
        :label="t('dashboard.rank.column.title')"
        min-width="200"
        show-overflow-tooltip
      />
      <ElTableColumn
        prop="author"
        :label="t('dashboard.rank.column.author')"
        width="120"
        show-overflow-tooltip
      />
      <ElTableColumn prop="score" :label="t('dashboard.rank.column.likes')" width="100" sortable />
      <ElTableColumn
        prop="publish_time"
        :label="t('dashboard.rank.column.publishTime')"
        width="120"
      />
    </ElTable>
  </DashboardCard>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElTable, ElTableColumn, ElImage, ElMessage } from 'element-plus'
  import DashboardCard from './DashboardCard.vue'
  import { getNoteRank, type RankItem } from '@/api/dashboard'
  import { getNoteResourceImageUrl } from '@/api/automation/note'

  const { t } = useI18n()
  const list = ref<RankItem[]>([])
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getNoteRank()
      list.value = res.items
    } catch (error) {
      console.error(error)
      ElMessage.error(t('dashboard.rank.fetchError'))
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style scoped lang="scss"></style>
