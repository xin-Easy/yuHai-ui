export const onRequest = async (context) => {
  const { request, env, next } = context;

  const response = await next();

  if (response.status === 200) {
    const contentType = response.headers.get('Content-Type') || '';
    const isHtml = contentType.includes('text/html');

    if (isHtml) {
      const assets = JSON.stringify({
        CLERK_PUBLISHABLE_KEY: env.PUBLIC_CLERK_PUBLISHABLE_KEY || '',
        API_BASE_URL: env.PUBLIC_API_BASE_URL || '',
        APP_ENV: env.PUBLIC_APP_ENV || 'development',
        APP_DEBUG: env.PUBLIC_APP_DEBUG === 'true',
        APP_VERSION: env.PUBLIC_APP_VERSION || '1.0.0',
        CLOUDFLARE_ENV: env.CLOUDFLARE_ENV || 'development'
      });

      const injectScript = `<script>globalThis.ASSETS=${assets};</script>`;
      const newResponse = new Response(
        (await response.text()).replace('<head>', `<head>${injectScript}`),
        response
      );
      return newResponse;
    }
  }

  return response;
};
