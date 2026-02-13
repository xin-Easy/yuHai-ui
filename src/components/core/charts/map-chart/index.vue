<!-- 地图图表 -->
<template>
  <div class="relative w-full" :style="{ height: props.height || 'calc(100vh - 120px)' }">
    <div v-if="isEmpty" class="h-full flex-cc">
      <ElEmpty description="暂无地图数据" />
    </div>

    <div v-else id="china-map" ref="chartRef" class="h-full w-full overflow-hidden rounded-lg" />
  </div>
</template>

<script setup lang="ts">
  import { echarts } from '@/plugins/echarts'
  import { useSettingStore } from '@/store/modules/setting'
  // 移除静态引用
  // import chinaMapJson from '@/assets/json/chinaMap.json'
  import type { MapChartProps } from '@/types/component/chart'
  import { useChart } from '@/hooks/core/useChart'

  defineOptions({ name: 'ArtMapChart' })
  
  // 保存地图数据
  const chinaMapJson = shallowRef<any>(null)

  const settingStore = useSettingStore()
  const { isDark } = storeToRefs(settingStore)

  const props = withDefaults(defineProps<MapChartProps>(), {
    mapData: () => [],
    selectedRegion: '',
    showLabels: true,
    showScatter: true,
    isEmpty: false
  })

  // 定义 emit
  const emit = defineEmits<{
    renderComplete: []
    regionClick: [region: { name: string; adcode: string; level: string }]
  }>()

  // 检查是否为空数据
  const isEmpty = computed(() => {
    return props.isEmpty || (!props.mapData?.length && !chinaMapJson.value)
  })

  // 处理地图点击事件
  const handleMapClick = (params: any) => {
    if (params.componentType === 'series') {
      const data = params.data as Record<string, unknown> | undefined
      const regionData = {
        name: params.name as string,
        adcode: (data?.adcode as string) || '',
        level: (data?.level as string) || ''
      }

      console.log(`选中区域: ${params.name}`, params)

      // 高亮选中区域
      const instance = getChartInstance()
      instance?.dispatchAction({
        type: 'select',
        seriesIndex: 0,
        dataIndex: params.dataIndex as number
      })

      emit('regionClick', regionData)
    }
  }

  const { chartRef, initChart, getChartInstance } = useChart({
    onChartInit: (instance) => {
      instance.on('click', handleMapClick)
    }
  })

  // 数据名称归一化适配，解决接口返回名称与地图文件不一致问题
  const resolveMapData = (sourceData: any[], mapJson: any) => {
    if (!mapJson || !sourceData || sourceData.length === 0) return []
    
    const features = mapJson.features || []
    const mapNames = features.map((f: any) => f.properties.name)

    // 归一化辅助函数：去除常见后缀和前缀
    const normalizeName = (name: string) => {
      return name.replace(/(?:中国|省|市|自治区|壮族|回族|维吾尔|特别行政区)/g, '')
    }

    return sourceData.map(item => {
      // 1. 尝试直接精确匹配
      let standardName = mapNames.find((name: string) => name === item.name)
      
      // 2. 尝试前缀匹配 (如 "广东" -> "广东省")
      if (!standardName) {
        standardName = mapNames.find((name: string) => name.startsWith(item.name))
      }

      // 3. 尝试归一化匹配 (如 "中国香港" -> "香港" <- "香港特别行政区")
      if (!standardName) {
        const normItemName = normalizeName(item.name)
        standardName = mapNames.find((name: string) => normalizeName(name) === normItemName)
      }

      return {
        ...item,
        name: standardName || item.name
      }
    })
  }

  // 根据 geoJson 数据准备地图数据（仅用于无数据时的演示）
  const prepareMapData = (geoJson: {
    features: Array<{ properties: Record<string, unknown> }>
  }) => {
    return geoJson.features.map((feature) => ({
      name: feature.properties.name as string,
      value: Math.round(Math.random() * 1000),
      adcode: feature.properties.adcode as string,
      level: feature.properties.level as string,
      selected: false
    }))
  }

  // 获取主题相关的样式配置
  const getThemeStyles = () => ({
    borderColor: isDark.value ? 'rgba(255,255,255,0.6)' : 'rgba(147,235,248,1)',
    shadowColor: isDark.value ? 'rgba(0,0,0,0.8)' : 'rgba(128,217,248,1)',
    labelColor: isDark.value ? '#fff' : '#333',
    backgroundColor: isDark.value ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)'
  })

  // 构造 ECharts 配置项
  const createChartOption = (mapData: Array<Record<string, unknown>>) => {
    const themeStyles = getThemeStyles()
    
    // 计算数据最大值用于 visualMap
    const maxVal = Math.max(...mapData.map(d => Number(d.value) || 0), 100)

    return {
      animation: false,
      tooltip: {
        show: true,
        backgroundColor: themeStyles.backgroundColor,
        borderColor: isDark.value ? '#333' : '#ddd',
        borderWidth: 1,
        textStyle: {
          color: themeStyles.labelColor
        },
        formatter: ({ data, name }: { data?: Record<string, unknown>; name: string }) => {
          const { value } = data || {}
          return `
            <div style="padding: 8px;">
              <div>地区：${name || '未知区域'}</div>
              <div>评论数：${value !== undefined ? value : 0}</div>
            </div>
          `
        }
      },
      visualMap: {
        min: 0,
        max: maxVal,
        left: '20',
        bottom: '20',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: isDark.value 
            ? ['#1f2937', '#374151', '#4b5563', '#60a5fa', '#3b82f6', '#2563eb'] 
            : ['#f3f4f6', '#d1d5db', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']
        },
        textStyle: {
          color: themeStyles.labelColor
        }
      },
      geo: {
        map: 'china',
        zoom: 1.2,
        roam: true,
        scaleLimit: {
          min: 0.8,
          max: 3
        },
        label: {
          show: props.showLabels,
          color: isDark.value ? '#ccc' : '#666',
          fontSize: 10
        },
        itemStyle: {
          areaColor: isDark.value ? '#1f2937' : '#f3f4f6',
          borderColor: isDark.value ? '#374151' : '#d1d5db',
          borderWidth: 1
        },
        emphasis: {
          label: {
            show: true,
            color: isDark.value ? '#fff' : '#333'
          },
          itemStyle: {
            areaColor: isDark.value ? '#374151' : '#e5e7eb'
          }
        }
      },
      series: [
        {
          type: 'map',
          map: 'china',
          geoIndex: 0,
          aspectScale: 0.75,
          showLegendSymbol: false,
          label: {
            show: props.showLabels,
            color: isDark.value ? '#fff' : '#333'
          },
          itemStyle: {
            borderColor: isDark.value ? '#374151' : '#fff',
            borderWidth: 1
          },
          emphasis: {
            label: {
              show: true
            },
            itemStyle: {
              areaColor: '#F99020'
            }
          },
          data: mapData
        }
      ]
    }
  }

  // 初始化并渲染地图
  const initMap = async (): Promise<void> => {
    if (!chinaMapJson.value) {
      try {
        const module = await import('@/assets/json/chinaMap.json')
        chinaMapJson.value = module.default
      } catch (e) {
        console.error('Failed to load map data:', e)
        return
      }
    }
    
    // 确保 DOM 更新后再渲染
    await nextTick()

    echarts.registerMap('china', chinaMapJson.value as any)
    
    // 使用 resolveMapData 处理传入的数据，或者使用随机演示数据
    const mapData = props.mapData.length > 0 
      ? resolveMapData(props.mapData, chinaMapJson.value) 
      : prepareMapData(chinaMapJson.value)
      
    const option = createChartOption(mapData)

    initChart(option as any)
    emit('renderComplete')
  }

  // 生命周期钩子
  onMounted(() => {
    // 强制初始化地图，确保资源加载
    initMap()
  })

  // 监听主题变化，重新初始化地图
  watch(isDark, (newVal, oldVal) => {
    if (newVal !== oldVal) {
      nextTick(() => {
        // 如果地图已加载，重新渲染
        if (chinaMapJson.value) {
          const mapData = props.mapData.length > 0 
            ? resolveMapData(props.mapData, chinaMapJson.value) 
            : prepareMapData(chinaMapJson.value)
          const option = createChartOption(mapData)
          initChart(option as any)
        } else {
          initMap()
        }
      })
    }
  })

  // 监听数据变化
  watch(
    () => props.mapData,
    () => {
      nextTick(() => {
        if (!chinaMapJson.value) {
          initMap()
        } else {
          const mapData = props.mapData.length > 0 
            ? resolveMapData(props.mapData, chinaMapJson.value) 
            : prepareMapData(chinaMapJson.value)
          const option = createChartOption(mapData)
          initChart(option as any)
        }
      })
    },
    { deep: true }
  )
</script>
