<template>
  <div class="core-log-page">
    <div class="toolbar">
      <el-input
        v-model="keyword"
        :placeholder="t('update.coreLog.searchPlaceholder')"
        clearable
        class="toolbar-item"
      />
      <el-select
        v-model="level"
        class="toolbar-item"
        :placeholder="t('update.coreLog.level')"
        style="width: 140px"
      >
        <el-option :label="t('update.coreLog.all')" value="all" />
        <el-option label="stdout" value="stdout" />
        <el-option label="stderr" value="stderr" />
        <el-option label="info" value="info" />
        <el-option label="error" value="error" />
        <el-option label="exit" value="exit" />
      </el-select>
      <el-select
        v-model="encoding"
        class="toolbar-item"
        :placeholder="t('update.coreLog.encoding')"
        style="width: 140px"
      >
        <el-option :label="t('update.coreLog.auto')" value="auto" />
        <el-option label="UTF-8" value="utf-8" />
        <el-option label="GBK" value="gbk" />
      </el-select>
      <el-switch
        v-model="autoScroll"
        :active-text="t('update.coreLog.autoScroll')"
        class="toolbar-item"
      />
      <el-switch
        v-model="syncConsole"
        :active-text="t('update.coreLog.syncConsole')"
        class="toolbar-item"
      />
      <el-button @click="clear" class="toolbar-item">{{ t('update.coreLog.clear') }}</el-button>
      <el-button @click="download" class="toolbar-item">{{ t('update.coreLog.export') }}</el-button>
      <el-button @click="pause = !pause" type="primary" class="toolbar-item">{{
        pause ? t('update.coreLog.resume') : t('update.coreLog.pause')
      }}</el-button>
    </div>

    <el-card class="log-card">
      <template #header>
        <div class="card-header">
          <div class="status"
            ><span :class="['dot', pause ? 'paused' : 'running']"></span
            >{{ pause ? t('update.coreLog.paused') : t('update.coreLog.running') }}</div
          >
          <div class="metrics">
            <span>{{ t('update.coreLog.totalLines') }} {{ logs.length }}</span>
            <span>stdout {{ stdoutCount }}</span>
            <span>stderr {{ stderrCount }}</span>
            <span>error {{ errorCount }}</span>
          </div>
        </div>
      </template>
      <el-scrollbar class="log-box" ref="logBox">
        <div v-for="item in filtered" :key="item.id" :class="['log-line', item.type]">
          <span class="ts">{{ formatTs(item.ts) }}</span>
          <el-tag size="small" :type="tagType(item.type)" class="type-tag">{{ item.type }}</el-tag>
          <span class="text">{{ item.text }}</span>
        </div>
      </el-scrollbar>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, reactive, ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { listen } from '@tauri-apps/api/event'

  const { t } = useI18n()

  type LogType = 'stdout' | 'stderr' | 'info' | 'error' | 'exit'
  interface LogItem {
    id: number
    ts: number
    type: LogType
    text: string
  }

  const logs = reactive<LogItem[]>([])
  const autoScroll = ref(true)
  const pause = ref(false)
  const keyword = ref('')
  const level = ref<'all' | LogType>('all')
  const encoding = ref<'auto' | 'utf-8' | 'gbk'>('auto')
  const syncConsole = ref(true)
  const logBox = ref<HTMLDivElement | null>(null)
  let unsubscribe: (() => void) | null = null
  let counter = 0

  const base64ToBytes = (b64: string): Uint8Array => {
    const binary = atob(b64)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  }

  const decodeWith = (enc: string, bytes: Uint8Array): string => {
    try {
      const decoder = new TextDecoder(enc as any, { fatal: false })
      return decoder.decode(bytes)
    } catch {
      return ''
    }
  }

  const hasReplacementChar = (s: string): boolean => s.includes('\uFFFD') || s.includes('�')

  const decodeBytes = (bytes: Uint8Array): string => {
    const useEnc = encoding.value
    if (useEnc === 'utf-8') return decodeWith('utf-8', bytes)
    if (useEnc === 'gbk') return decodeWith('gbk', bytes) || decodeWith('gb18030', bytes)
    const utf8 = decodeWith('utf-8', bytes)
    if (!hasReplacementChar(utf8)) return utf8
    const gbk = decodeWith('gbk', bytes) || decodeWith('gb18030', bytes)
    return gbk || utf8
  }

  const stdoutCount = computed(() => logs.filter((l) => l.type === 'stdout').length)
  const stderrCount = computed(() => logs.filter((l) => l.type === 'stderr').length)
  const errorCount = computed(() => logs.filter((l) => l.type === 'error').length)
  const tagType = (t: LogType) =>
    t === 'stdout'
      ? 'success'
      : t === 'stderr' || t === 'error'
        ? 'danger'
        : t === 'exit'
          ? 'warning'
          : 'info'

  const pushLog = (type: LogType, text: string) => {
    if (pause.value) return
    const item: LogItem = { id: ++counter, ts: Date.now(), type, text }
    logs.push(item)
    if (logs.length > 2000) logs.splice(0, logs.length - 2000)
    if (syncConsole.value) {
      console.log(`[Core][${type}] ${text}`)
    }
    if (autoScroll.value && logBox.value) {
      requestAnimationFrame(() => {
        const el = logBox.value as any
        if (el && typeof el.setScrollTop === 'function') el.setScrollTop(1e9)
      })
    }
  }

  const filtered = computed(() => {
    return logs.filter((l) => {
      const byLevel = level.value === 'all' ? true : l.type === level.value
      const byKeyword = keyword.value
        ? l.text.toLowerCase().includes(keyword.value.toLowerCase())
        : true
      return byLevel && byKeyword
    })
  })

  const clear = (): void => {
    logs.splice(0, logs.length)
  }

  const download = (): void => {
    const lines = logs.map((l) => `${formatTs(l.ts)} [${l.type}] ${l.text}`).join('\n')
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ;(window as any).saveAs
      ? (window as any).saveAs(blob, `core-log-${Date.now()}.txt`)
      : (() => {
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = `core-log-${Date.now()}.txt`
          a.click()
          URL.revokeObjectURL(a.href)
        })()
  }

  const formatTs = (ts: number): string => {
    const d = new Date(ts)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  onMounted(async () => {
    if (window.__TAURI_INTERNALS__) {
      const unlisten = await listen('core:log', (event: any) => {
        const payload = event.payload
        const logType: LogType = payload?.type ?? 'info'
        if (logType === 'exit') {
          const code = payload?.code ?? 'null'
          const signal = payload?.signal ?? 'null'
          pushLog('exit', `${t('update.coreLog.exit')}: code=${code} signal=${signal}`)
          return
        }
        let text = ''
        if (payload?.base64) {
          const bytes = base64ToBytes(String(payload.base64))
          text = decodeBytes(bytes)
        } else if (payload?.text) {
          text = String(payload.text)
        }
        if (text) pushLog(logType, text)
      })
      unsubscribe = unlisten
    }
  })

  onBeforeUnmount(() => {
    if (unsubscribe) unsubscribe()
  })
</script>

<style scoped lang="scss">
  .core-log-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .toolbar-item {
    min-width: 120px;
  }
  .log-card {
    flex: 1;
    overflow: hidden;
  }
  .log-box {
    height: 100%;
    overflow: auto;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
      monospace;
    font-size: 13px;
    line-height: 1.6;
    padding: 8px 12px;
    background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
    color: #e5e7eb;
  }
  .log-line {
    display: flex;
    gap: 8px;
    padding: 2px 0;
  }
  .type-tag {
    min-width: 72px;
    text-transform: uppercase;
  }
  .log-line .ts {
    color: #9ca3af;
  }
  .log-line .tag {
    color: #666;
    min-width: 56px;
  }
  .log-line.stdout .text {
    color: #10b981;
  }
  .log-line.stderr .text,
  .log-line.error .text {
    color: #ef4444;
  }
  .log-line.info .text {
    color: #60a5fa;
  }
  .log-line.exit .text {
    color: #f59e0b;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .dot.running {
    background: #10b981;
  }
  .dot.paused {
    background: #f59e0b;
  }
  .metrics {
    display: flex;
    gap: 10px;
    color: #9ca3af;
  }
</style>
