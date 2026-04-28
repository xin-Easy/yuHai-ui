/**
 * Cloudflare Pages Worker - 环境变量注入
 *
 * 官方多环境配置方案：
 * 1. 本地开发：使用 .dev.vars 文件
 * 2. 生产环境：在 Cloudflare Dashboard → Pages → 设置 → 环境变量
 *
 * 环境变量命名规范（Cloudflare Pages）：
 * - 以 PUBLIC_ 前缀开头的变量会暴露给前端
 * - 其他变量仅在后端使用
 */

export default {
  async fetch(request, env, ctx) {
    // 注入环境变量到全局对象，供前端代码访问
    // 这些变量在 Cloudflare Dashboard 或 .dev.vars 中配置
    const assets = {
      // Clerk 配置
      // 前端需要使用 Clerk Publishable Key
      // 获取地址：https://dashboard.clerk.com → 你的应用 → API Keys
      CLERK_PUBLISHABLE_KEY: env.PUBLIC_CLERK_PUBLISHABLE_KEY || '',

      // API 配置
      API_BASE_URL: env.PUBLIC_API_BASE_URL || '',

      // 应用配置
      APP_ENV: env.PUBLIC_APP_ENV || 'development',
      APP_DEBUG: env.PUBLIC_APP_DEBUG === 'true',

      // 版本信息
      APP_VERSION: env.PUBLIC_APP_VERSION || '1.0.0',

      // Cloudflare Pages 环境信息
      CLOUDFLARE_ENV: env.CLOUDFLARE_ENV || 'development'
    };

    return env.ASSETS.fetch(request, {
      cf: request.cf,
      globals: {
        ...globalThis,
        ASSETS: assets
      }
    });
  }
};
