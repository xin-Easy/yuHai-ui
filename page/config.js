/**
 * 全局配置文件
 *
 * 使用官方 Cloudflare Pages 多环境配置方案：
 * 1. 环境变量通过 Cloudflare Dashboard 或 .dev.vars 文件配置
 * 2. _worker.js 将环境变量注入到前端
 * 3. 此文件从 globalThis.ASSETS 读取配置
 */

(function() {
  'use strict';

  // ==========================================
  // 从 _worker.js 注入的环境变量中读取配置
  // ==========================================
  const ASSETS = typeof globalThis !== 'undefined' ? globalThis.ASSETS : {};

  // ==========================================
  // Clerk 配置
  // ==========================================
  const CLERK_PUBLISHABLE_KEY = ASSETS.CLERK_PUBLISHABLE_KEY || '';

  // ==========================================
  // 环境检测（基于注入的环境变量）
  // ==========================================
  const currentEnv = ASSETS.APP_ENV || 'development';
  const isProduction = currentEnv === 'production';
  const isDebug = ASSETS.APP_DEBUG === true;

  // ==========================================
  // 完整配置
  // ==========================================
  const CONFIG = {

    // ============================================
    // Clerk 认证配置
    // ============================================
    clerk: {
      publishableKey: CLERK_PUBLISHABLE_KEY,
      version: '5',
      cdnUrl: 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js'
    },

    // ============================================
    // API 配置
    // ============================================
    api: {
      basePath: '',
      endpoints: {
        apiKeys: '/api/api-keys',
        apiKeysManage: '/api/api-keys-manage',
        example: '/api/example',
        userData: '/api/user-data'
      }
    },

    // ============================================
    // 应用配置
    // ============================================
    app: {
      name: 'yuhai',
      title: '控制台',
      version: ASSETS.APP_VERSION || '1.0.0',

      features: {
        apiKeyManagement: true,
        debugMode: isDebug && !isProduction,
        analytics: false,
        errorReporting: isProduction
      }
    },

    // ============================================
    // 环境信息
    // ============================================
    env: {
      current: currentEnv,
      isProduction: isProduction,
      description: isProduction
        ? '生产环境'
        : '开发环境'
    },

    // ============================================
    // 版本信息
    // ============================================
    version: ASSETS.APP_VERSION || '1.0.0',

    // ============================================
    // 开发者信息
    // ============================================
    developer: {
      name: 'yuhai team',
      email: 'support@yuhai.org',
      website: 'https://yuhai.org'
    }
  };

  // ==========================================
  // 暴露到全局
  // ==========================================
  window.APP_CONFIG = CONFIG;

  // ==========================================
  // 调试信息
  // ==========================================
  if (CONFIG.app.features.debugMode) {
    console.log('%c[Config] 应用配置已加载', 'color: #8b5cf6; font-weight: bold;');
    console.log('%c  环境:', 'color: #60a5fa;', CONFIG.env.current);
    console.log('%c  Clerk Key:', 'color: #60a5fa;', CONFIG.clerk.publishableKey.substring(0, 20) + '...');
  }

  // ==========================================
  // 生产环境初始化
  // ==========================================
  if (CONFIG.env.isProduction) {
    // 生产环境初始化代码
  }

})();
