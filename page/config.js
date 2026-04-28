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

  const ASSETS = typeof globalThis !== 'undefined' ? globalThis.ASSETS : {};

  if (!ASSETS.CLERK_PUBLISHABLE_KEY) {
    console.error('[Config] 缺少 CLERK_PUBLISHABLE_KEY，请在 Cloudflare Dashboard 配置');
    return;
  }

  const currentEnv = ASSETS.APP_ENV || 'development';
  const isProduction = currentEnv === 'production';
  const isDebug = ASSETS.APP_DEBUG === true;

  const CONFIG = {

    clerk: {
      publishableKey: ASSETS.CLERK_PUBLISHABLE_KEY,
      version: '5',
      cdnUrl: 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js'
    },

    api: {
      basePath: '',
      endpoints: {
        apiKeys: '/api/api-keys',
        apiKeysManage: '/api/api-keys-manage',
        example: '/api/example',
        userData: '/api/user-data'
      }
    },

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

    env: {
      current: currentEnv,
      isProduction: isProduction,
      description: isProduction
        ? '生产环境'
        : '开发环境'
    },

    version: ASSETS.APP_VERSION || '1.0.0',

    developer: {
      name: 'yuhai team',
      email: 'support@yuhai.org',
      website: 'https://yuhai.org'
    }
  };

  window.APP_CONFIG = CONFIG;

  if (CONFIG.app.features.debugMode) {
    console.log('%c[Config] 应用配置已加载', 'color: #8b5cf6; font-weight: bold;');
    console.log('%c  环境:', 'color: #60a5fa;', CONFIG.env.current);
    console.log('%c  Clerk Key:', 'color: #60a5fa;', CONFIG.clerk.publishableKey.substring(0, 20) + '...');
  }

})();
