/**
 * 存储键名管理器模块
 *
 * 提供版本化存储键管理功能
 *
 * ## 主要功能
 *
 * - 自动生成当前版本的存储键名
 * - 统一生成当前版本的存储键名
 *
 * ## 使用场景
 *
 * - Pinia Store 持久化插件中获取存储键
 * - 应用版本升级后的存储键管理
 *
 * ## 工作流程
 *
 * 1. 生成当前版本的存储键
 * 2. 返回当前版本的存储键供使用
 *
 * @module utils/storage/storage-key-manager
 * @author xingguang
 */
import { StorageConfig } from '@/utils/storage'

/**
 * 存储键名管理器
 * 负责处理版本化的存储键名生成
 */
export class StorageKeyManager {
  /**
   * 获取当前版本的存储键名
   */
  private getCurrentVersionKey(storeId: string): string {
    return StorageConfig.generateStorageKey(storeId)
  }

  /**
   * 获取持久化存储的键名
   */
  getStorageKey(storeId: string): string {
    return this.getCurrentVersionKey(storeId)
  }
}
