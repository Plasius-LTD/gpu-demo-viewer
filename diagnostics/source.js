import { showcaseAssetIntegrity } from './assets.js';

// Internal mount seam for tests. The public entrypoint never accepts loaders or
// an existing runtime. Registration is a consequence of this fixed source mount.
export async function createCuratedShowcaseSource({root,sceneEnabled,
  loadShared=()=>import('@plasius/gpu-shared'),
  loadRenderer=()=>import('@plasius/gpu-renderer')}) {
  let destroyed=false, runtime;
  if(sceneEnabled===true) {
    const shared=await loadShared();
    const integrity=Object.fromEntries(Object.entries(showcaseAssetIntegrity).map(
      ([key,digest])=>[String(shared.resolveShowcaseAssetUrl(key)),digest]));
    runtime=await shared.mountGpuShowcase({root,focus:'integrated',
      packageName:'@plasius/gpu-demo-viewer',
      __featureFlags:{'gpu-demo.scene-fidelity.enabled':true,gpu_showcase_realistic_models_v1:false,
        'gpu.model.conversion.enabled':false},gltfLoadOptions:{integrity}});
  }
  function eligible() {
    const state=runtime?.state;
    return !destroyed && state?.assetCatalog?.mode==='modeled-baseline' &&
      state.assetCatalog.fallbackReason===null && state.rendererUnavailable!==true &&
      state.nativeRenderer?.backend==='webgpu-raster' && state.nativeRenderer.submittedFrames>0;
  }
  return Object.freeze({
    async observe(consent,isCurrent=()=>true) {
      if(consent!==true || !isCurrent() || !eligible())return null;
      const {createFeedbackGameDiagnosticSnapshot}=await loadRenderer();
      if(!isCurrent() || !eligible())return null;
      const frame=runtime.state.nativeRenderer;
      // Never pass the frame, canvas, telemetry, raw errors or other scene state
      // across the renderer diagnostics boundary. Synthetic timing stays unknown.
      return createFeedbackGameDiagnosticSnapshot({featureEnabled:true,capabilityGranted:true,
        consentConfirmed:true,surfaceId:'site.gpu-demo',renderer:'webgpu',backend:'browser',
        viewportWidth:frame.width,viewportHeight:frame.height,frameRate:undefined,frameTimeMs:undefined,
        featureIds:['renderer.frame-loop'],counters:[],errorCodes:[]});
    },
    destroy() { if(destroyed)return;destroyed=true;runtime?.destroy();runtime=undefined; },
  });
}
