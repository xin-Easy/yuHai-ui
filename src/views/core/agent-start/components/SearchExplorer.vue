<template>
  <AgentForm :template-id="templateId" :template-data="templateData" />
</template>

<script setup lang="ts">
  import AgentForm from './AgentForm.vue'
  import type { AgentTemplate } from '@/api/automation/task'

  defineProps<{
    templateData?: AgentTemplate
  }>()

  const templateId = 'search_explorer'
</script>
