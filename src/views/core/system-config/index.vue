<template>
  <div class="system-config p-4">
    <div class="max-w-4xl mx-auto space-y-6">
      <div v-for="section in sections" :key="section.title" class="config-section">
        <el-card
          shadow="never"
          class="rounded-lg border-gray-200 dark:border-gray-700 bg-[var(--default-box-color)]"
        >
          <template #header>
            <div class="font-medium text-lg text-gray-800 dark:text-gray-100">
              {{ $t(section.title) }}
            </div>
          </template>

          <div class="space-y-4">
            <div
              v-for="item in section.items"
              :key="item.key"
              class="flex items-center justify-between py-2"
            >
              <div class="flex-1 pr-4">
                <div class="font-medium text-gray-700 dark:text-gray-200">
                  {{ $t(item.label) }}
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                  {{ item.key }}
                </div>
                <div v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{
                  item.description
                }}</div>
              </div>

              <div class="w-64 flex justify-end">
                <!-- Boolean Type (Switch) -->
                <el-switch
                  v-if="item.type === 'boolean'"
                  v-model="configState[item.key]"
                  @change="handleChange(item.key, $event)"
                  :loading="loadingState[item.key]"
                />

                <!-- Select Type -->
                <el-select
                  v-else-if="item.type === 'select'"
                  v-model="configState[item.key]"
                  @change="handleChange(item.key, $event)"
                  :loading="loadingState[item.key]"
                  class="w-full"
                >
                  <el-option
                    v-for="opt in item.options"
                    :key="opt.value"
                    :label="$t(opt.label)"
                    :value="opt.value"
                  />
                </el-select>

                <!-- String/Number Type (Input) -->
                <el-input
                  v-else
                  v-model="configState[item.key]"
                  :type="item.type === 'password' ? 'password' : 'text'"
                  @change="handleChange(item.key, $event)"
                  :disabled="loadingState[item.key]"
                >
                  <template #suffix v-if="loadingState[item.key]">
                    <el-icon class="is-loading"><Loading /></el-icon>
                  </template>
                </el-input>
              </div>

              <!-- Delete/Reset Button -->
              <div class="ml-4">
                <el-tooltip :content="$t('core.systemConfig.actions.reset')" placement="top">
                  <el-button
                    circle
                    size="small"
                    type="danger"
                    plain
                    :icon="Delete"
                    @click="handleReset(item.key)"
                    :loading="loadingState[item.key]"
                  />
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <TipsPanel class="mt-4" title="系统配置提示">
      <ul>
        <li>配置系统的核心参数，包括数据库、浏览器和 AI 设置。</li>
        <li>修改配置后系统会自动保存，部分配置可能需要重启服务生效。</li>
        <li>点击红色重置按钮可将配置项恢复为默认值。</li>
      </ul>
    </TipsPanel>
  </div>
</template>

<script setup lang="ts">
  import { reactive, onMounted, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Loading, Delete } from '@element-plus/icons-vue'
  import { getAllConfigs, createConfig, updateConfig, deleteConfig } from '@/api/system'
  import TipsPanel from '@/components/core/widget/tips-panel/index.vue'
  defineOptions({ name: 'SystemConfig' })

  interface ConfigDef {
    key: string
    label: string
    type: 'string' | 'number' | 'boolean' | 'select' | 'password'
    options?: { label: string; value: any }[]
    description?: string
    default?: any
  }

  interface SectionDef {
    title: string
    items: ConfigDef[]
  }

  // Definition of sections and items based on user requirement
  const sections: SectionDef[] = [
    {
      title: 'core.systemConfig.sections.tenant',
      items: [
        {
          key: 'TENANT_ID',
          label: 'core.systemConfig.items.TENANT_ID',
          type: 'string',
          default: '0'
        }
      ]
    },
    {
      title: 'core.systemConfig.sections.browser',
      items: [
        {
          key: 'BROWSER_ATTACH',
          label: 'core.systemConfig.items.BROWSER_ATTACH',
          type: 'boolean',
          default: false
        },
        {
          key: 'BROWSER_HEADLESS',
          label: 'core.systemConfig.items.BROWSER_HEADLESS',
          type: 'boolean',
          default: false
        },
        {
          key: 'BROWSER_PORT',
          label: 'core.systemConfig.items.BROWSER_PORT',
          type: 'number',
          default: 9222
        }
      ]
    },
    {
      title: 'core.systemConfig.sections.ai',
      items: [
        {
          key: 'AI_PROVIDER',
          label: 'core.systemConfig.items.AI_PROVIDER',
          type: 'select',
          default: 'deepseek',
          options: [
            { label: 'core.systemConfig.options.deepseek', value: 'deepseek' },
            { label: 'core.systemConfig.options.openai', value: 'openai' },
            { label: 'core.systemConfig.options.aliyun', value: 'aliyun' }
          ]
        },
        {
          key: 'AI_API_KEY',
          label: 'core.systemConfig.items.AI_API_KEY',
          type: 'password',
          default: ''
        },
        {
          key: 'AI_BASE_URL',
          label: 'core.systemConfig.items.AI_BASE_URL',
          type: 'string',
          default: 'https://api.deepseek.com'
        },
        {
          key: 'AI_MODEL_NAME',
          label: 'core.systemConfig.items.AI_MODEL_NAME',
          type: 'string',
          default: 'deepseek-chat'
        }
      ]
    },
    {
      title: 'core.systemConfig.sections.db',
      items: [
        {
          key: 'DB_TYPE',
          label: 'core.systemConfig.items.DB_TYPE',
          type: 'select',
          default: 'sqlite',
          options: [
            { label: 'SQLite', value: 'sqlite' },
            { label: 'MySQL', value: 'mysql' },
            { label: 'PostgreSQL', value: 'postgresql' }
          ]
        },
        {
          key: 'DB_HOST',
          label: 'core.systemConfig.items.DB_HOST',
          type: 'string',
          default: 'localhost'
        },
        { key: 'DB_PORT', label: 'core.systemConfig.items.DB_PORT', type: 'string', default: '' },
        {
          key: 'DB_USER',
          label: 'core.systemConfig.items.DB_USER',
          type: 'string',
          default: 'root'
        },
        {
          key: 'DB_PASSWORD',
          label: 'core.systemConfig.items.DB_PASSWORD',
          type: 'password',
          default: ''
        },
        {
          key: 'DB_NAME',
          label: 'core.systemConfig.items.DB_NAME',
          type: 'string',
          default: 'yuhai'
        },
        {
          key: 'DB_ECHO',
          label: 'core.systemConfig.items.DB_ECHO',
          type: 'boolean',
          default: false
        },
        {
          key: 'SQLITE_FILE',
          label: 'core.systemConfig.items.SQLITE_FILE',
          type: 'string',
          default: 'yuhai.db'
        }
      ]
    },
    {
      title: 'core.systemConfig.sections.dbPool',
      items: [
        {
          key: 'DB_POOL_MIN_SIZE',
          label: 'core.systemConfig.items.DB_POOL_MIN_SIZE',
          type: 'number',
          default: 1
        },
        {
          key: 'DB_POOL_MAX_SIZE',
          label: 'core.systemConfig.items.DB_POOL_MAX_SIZE',
          type: 'number',
          default: 10
        },
        {
          key: 'DB_CONNECT_TIMEOUT',
          label: 'core.systemConfig.items.DB_CONNECT_TIMEOUT',
          type: 'number',
          default: 60
        },
        {
          key: 'DB_CHARSET',
          label: 'core.systemConfig.items.DB_CHARSET',
          type: 'string',
          default: 'utf8mb4'
        }
      ]
    }
  ]

  // State
  const configState = reactive<Record<string, any>>({})
  const loadingState = reactive<Record<string, boolean>>({})
  const existingKeys = ref<Set<string>>(new Set())

  // Initialize state with defaults
  sections.forEach((section) => {
    section.items.forEach((item) => {
      configState[item.key] = item.default
    })
  })

  const fetchConfigs = async () => {
    try {
      const res = await getAllConfigs()
      if (res && Array.isArray(res)) {
        res.forEach((item) => {
          // Track existing keys
          existingKeys.value.add(item.key)
          
          let val = item.value

          // Simple type casting based on definition
          const def = findDef(item.key)
          if (def) {
            if (def.type === 'boolean' && typeof val === 'string') {
              val = val.toLowerCase() === 'true'
            } else if (def.type === 'number' && typeof val === 'string') {
              val = Number(val)
            }
            configState[item.key] = val
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch configs', error)
      ElMessage.error('Failed to load configurations')
    }
  }

  const findDef = (key: string) => {
    for (const s of sections) {
      const found = s.items.find((i) => i.key === key)
      if (found) return found
    }
    return null
  }

  const handleChange = async (key: string, value: any) => {
    loadingState[key] = true
    try {
      // Determine description from definition
      const def = findDef(key)
      const description = def ? def.label : ''

      let payloadValue = value
      if (typeof value !== 'string') {
        payloadValue = String(value)
      }

      if (existingKeys.value.has(key)) {
        // Update
        await updateConfig(key, {
          value: payloadValue,
          description
        })
      } else {
        // Create
        await createConfig({
          key,
          value: payloadValue,
          description
        })
        existingKeys.value.add(key)
      }
      
      ElMessage.success('Saved')
    } catch (error) {
      console.error(error)
      ElMessage.error('Failed to save')
    } finally {
      loadingState[key] = false
    }
  }

  const handleReset = async (key: string) => {
    loadingState[key] = true
    try {
      if (existingKeys.value.has(key)) {
        await deleteConfig(key)
        existingKeys.value.delete(key)
      }
      
      // Reset local state to default
      const def = findDef(key)
      if (def) {
        configState[key] = def.default
      }
      ElMessage.success('Reset to default')
    } catch (error) {
      console.error(error)
      ElMessage.error('Failed to reset')
    } finally {
      loadingState[key] = false
    }
  }

  onMounted(() => {
    fetchConfigs()
  })
</script>

<style scoped>
  .system-config {
    background-color: var(--default-bg-color);
    min-height: 100%;
  }
</style>
