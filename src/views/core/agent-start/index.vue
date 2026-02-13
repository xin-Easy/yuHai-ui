<template>
  <div class="agent-start p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-medium">{{ t('core.agentStart.title') }}</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="demo-tabs">
        <el-tab-pane :label="t('core.agentStart.generalBrowser')" name="general_browser">
          <GeneralBrowser
            v-if="activeTab === 'general_browser'"
            :template-data="getTemplateData('general_browser')"
          />
        </el-tab-pane>
        <el-tab-pane :label="t('core.agentStart.deepBrowser')" name="deep_browser">
          <DeepBrowser
            v-if="activeTab === 'deep_browser'"
            :template-data="getTemplateData('deep_browser')"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <TipsPanel class="mt-4" title="Agent 启动注意事项">
      <ul>
        <li><strong>重要提示：启动任务前，请务必前往【系统配置】页面正确设置大模型参数（API Key、Base URL），否则 Agent 将无法正常工作。</strong></li>
        <li>请确保网络环境畅通，部分涉及跨境访问的任务可能需要配置系统代理。</li>
        <li>建议首次使用时，先通过“通用浏览器”模式测试基础连通性。</li>
        <li>系统已针对大模型数据采集进行深度优化，Token 消耗极低，且账号封禁风险极小。</li>
      </ul>
    </TipsPanel>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { getAgentTemplates, type AgentTemplate } from '@/api/automation/task'
  import GeneralBrowser from './components/GeneralBrowser.vue'
  import DeepBrowser from './components/DeepBrowser.vue'
  import TipsPanel from '@/components/core/widget/tips-panel/index.vue'

  const { t } = useI18n()

  defineOptions({ name: 'AgentStart' })

  const activeTab = ref('general_browser')
  const templates = ref<AgentTemplate[]>([])

  const getTemplateData = (id: string) => {
    return templates.value.find((t) => t.id === id)
  }

  const fetchTemplates = async () => {
    try {
      const res = await getAgentTemplates()
      templates.value = res || []
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  onMounted(() => {
    fetchTemplates()
  })
</script>
