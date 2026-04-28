export default {
  async fetch(request, env, ctx) {
    const assets = {
      CLERK_PUBLISHABLE_KEY: env.PUBLIC_CLERK_PUBLISHABLE_KEY || '',
      API_BASE_URL: env.PUBLIC_API_BASE_URL || '',
      APP_ENV: env.PUBLIC_APP_ENV || 'development',
      APP_DEBUG: env.PUBLIC_APP_DEBUG === 'true',
      APP_VERSION: env.PUBLIC_APP_VERSION || '1.0.0',
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
