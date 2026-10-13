import { isAbsolute } from 'node:path';
const source=process.env.PLASIUS_SHARED_INSPECTION_SOURCE;
if(source && !isAbsolute(source))throw new Error('Inspection source override must be an absolute development path.');
export default {
  root: new URL('.', import.meta.url).pathname,
  cacheDir: '../node_modules/.vite-model-library',
  resolve: { alias: source ? { '@plasius/gpu-shared/model-inspection':source } : {} },
  server: { host: '127.0.0.1', port: 5291, strictPort: true, watch: { usePolling: true },
    ...(source ? {fs:{allow:[new URL('..',import.meta.url).pathname,source.replace(/\/src\/model-inspection\.js$/,'')]}} : {}) },
};
