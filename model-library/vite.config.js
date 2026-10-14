import { isAbsolute } from 'node:path';
const source=process.env.PLASIUS_SHARED_INSPECTION_SOURCE;
const renderer=process.env.PLASIUS_RENDERER_SOURCE;
const adaptive=process.env.PLASIUS_ADAPTIVE_RENDERER_SOURCE;
const lighting=process.env.PLASIUS_LIGHTING_SOURCE;
for(const path of [adaptive,lighting])if(path&&!isAbsolute(path))throw new Error('Adaptive source overrides must be absolute development paths.');
if(renderer && !isAbsolute(renderer))throw new Error('Renderer source override must be an absolute development path.');
if(source && !isAbsolute(source))throw new Error('Inspection source override must be an absolute development path.');
export default {
  root: new URL('.', import.meta.url).pathname,
  cacheDir: '../node_modules/.vite-model-library',
  resolve: { alias: {...(adaptive?{'@plasius/gpu-renderer/adaptive':adaptive}:{}),...(lighting?{'@plasius/gpu-lighting/radial-sampling':lighting}:{}),...(source ? { '@plasius/gpu-shared/model-inspection':source } : {}),...(renderer ? {'@plasius/gpu-renderer':renderer} : {})} },
  server: { host: '127.0.0.1', port: 5291, strictPort: true, watch: { usePolling: true },
    fs:{allow:[...[adaptive,lighting].filter(Boolean).map(path=>path.replace(/\/(src|dist)\/(index|adaptive|radial-sampling-plan)\.js$/,'')),new URL('..',import.meta.url).pathname,...(source?[source.replace(/\/src\/model-inspection\.js$/,'')]:[]),...(renderer?[renderer.replace(/\/(src|dist)\/index\.js$/,'')]:[])]} },
};
