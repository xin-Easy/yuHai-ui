/**
 * 图表组件类型定义模块
 *
 * 提供 ECharts 图表组件的完整类型定义
 *
 * ## 主要功能
 *
 * - 基础图表配置类型
 * - 柱状图类型定义
 * - 折线图类型定义
 * - 饼图/环形图类型定义
 * - 雷达图类型定义
 * - K线图类型定义
 * - 散点图类型定义
 * - 地图图表类型定义
 * - 双向堆叠柱状图类型定义
 * - 图表主题配置类型
 * - 图表事件回调类型
 *
 * ## 使用场景
 *
 * - 图表组件 Props 类型约束
 * - 图表配置类型定义
 * - 图表数据结构定义
 * - 图表事件处理
 *
 * @module types/component/chart
 * @author xingguang
 */
import type { EChartsOption, ECharts } from 'echarts'

// 图例位置类型
export type LegendPosition = 'bottom' | 'top' | 'left' | 'right'

export type SymbolType =
  | 'circle'
  | 'rect'
  | 'roundRect'
  | 'triangle'
  | 'diamond'
  | 'pin'
  | 'arrow'
  | 'none'

// 图表主题配置
export interface ChartThemeConfig {
  /** 图表高度 */
  chartHeight: string
  /** 字体大小 */
  fontSize: number
  /** 字体颜色 */
  fontColor: string
  /** 主题颜色 */
  themeColor: string
  /** 颜色组 */
  colors: string[]
}

// 图表初始化选项
export interface UseChartOptions {
  /** 初始化选项 */
  initOptions?: EChartsOption
  /** 延迟初始化时间(ms) */
  initDelay?: number
  /** IntersectionObserver阈值 */
  threshold?: number
  /** 是否自动响应主题变化 */
  autoTheme?: boolean
  /** 图表初始化回调 */
  onChartInit?: (chart: ECharts) => void
}

// 基础图表 Props 接口 - 统一所有图表的基础属性
export interface BaseChartProps {
  /** 图表高度 */
  height?: string
  /** 是否加载中 */
  loading?: boolean
  isEmpty?: boolean
  /** 颜色配置 */
  colors?: string[]
}

// 轴线显示控制接口 - 统一轴线相关配置
export interface AxisDisplayProps {
  /** 是否显示坐标轴标签 */
  showAxisLabel?: boolean
  /** 是否显示坐标轴线 */
  showAxisLine?: boolean
  /** 是否显示分割线 */
  showSplitLine?: boolean
}

// 交互显示控制接口 - 统一交互相关配置
export interface InteractionProps {
  /** 是否显示提示框 */
  showTooltip?: boolean
  /** 是否显示图例 */
  showLegend?: boolean
  /** 图例位置 */
  legendPosition?: LegendPosition
}

// 柱状图数据项接口
export interface BarDataItem {
  /** 系列名称 */
  name: string
  /** 数据值 */
  data: number[]
  /** 柱状图宽度 */
  barWidth?: string | number
  /** 堆叠分组名称 */
  stack?: string
}

// 柱状图 Props 接口 - 统一柱状图配置
export interface BarChartProps extends BaseChartProps, AxisDisplayProps, InteractionProps {
  /** 图表数据 - 支持单组数据或多组数据 */
  data: number[] | BarDataItem[]
  /** X轴标签数据 */
  xAxisData?: string[]
  /** 柱状图宽度 */
  barWidth?: string | number
  /** 是否堆叠显示 */
  stack?: boolean
  /** 圆角 */
  borderRadius?: number | number[]
}

// 折线图数据项接口
export interface LineDataItem {
  /** 系列名称 */
  name: string
  /** 数据值 */
  data: number[]
  /** 线条宽度 */
  lineWidth?: number
  /** 是否显示区域填充 */
  showAreaColor?: boolean
  /** 区域样式配置 */
  areaStyle?: {
    /** 渐变开始透明度 */
    startOpacity?: number
    /** 渐变结束透明度 */
    endOpacity?: number
    /** 自定义 ECharts areaStyle 配置 */
    custom?: any
  }
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 数据点符号 */
  symbol?: SymbolType
  /** 数据点大小 */
  symbolSize?: number
}

// 折线图 Props 接口 - 统一折线图配置
export interface LineChartProps extends BaseChartProps, AxisDisplayProps, InteractionProps {
  /** 图表数据 - 支持单组数据或多组数据 */
  data: number[] | LineDataItem[]
  /** X轴标签数据 */
  xAxisData?: string[]
  /** 线条宽度 */
  lineWidth?: number
  /** 是否显示区域填充 */
  showAreaColor?: boolean
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 数据点符号 */
  symbol?: SymbolType
  /** 数据点大小 */
  symbolSize?: number
  /** 多数据动画延迟间隔（毫秒） */
  animationDelay?: number
}

// 地图图表 Props 接口 - 统一地图图表配置
export interface MapChartProps extends BaseChartProps {
  /** 地图数据 */
  mapData?: any[]
  /** 选中区域 */
  selectedRegion?: string
  /** 是否显示标签 */
  showLabels?: boolean
  /** 是否显示散点 */
  showScatter?: boolean
}

// 图表配置生成器函数类型
export type ChartOptionGenerator = () => EChartsOption

// 图表事件回调类型
export type ChartEventCallback = (params: any) => void

// 图表错误信息接口
export interface ChartError {
  /** 错误码 */
  code: string
  /** 错误信息 */
  message: string
  /** 错误详情 */
  details?: any
}
