import { createReviewController, fixtureRequest, reviewEnabled } from './controller.js';

export async function mountLibrary({document:doc=globalThis.document,window:win=globalThis.window,
  fetch:request=globalThis.fetch,importRuntime=()=>import('@plasius/gpu-shared/model-inspection')}={}) {
  const el=id=>doc.getElementById(id),status=el('status');
  if (!reviewEnabled(win.location.href)) {
    status.textContent='Local review is disabled. Open this page on localhost with ?review=first-twelve.';
    return;
  }
  const response=await request(new URL('./catalogue.json',win.location.href));
  if (!response.ok) throw new Error('Model catalogue could not be loaded.');
  const {assets}=await response.json();
  for(const asset of assets) {
    const option=doc.createElement('option');option.value=asset.key;
    option.textContent=asset.name+(asset.entry?'':' — deferred');el('model').append(option);
  }
  const {createModelInspection}=await importRuntime();
  const controller=createReviewController({
    load:async(asset,signal)=>{
      const request=fixtureRequest(asset,new URL('./',win.location.href));
      el('canvas').hidden=false;
      return createModelInspection({canvas:el('canvas'),...request,signal,enabled:true,
        width:800,height:Math.max(1,Math.min(1440,Math.round(800*el('canvas').clientHeight/el('canvas').clientWidth))),
        onHintChange:visible=>{el('hint').hidden=!visible;},
        onError:error=>{status.textContent=`Render failed: ${error.message}`;}});
    },
    onState:state=>{
      el('hint').hidden=true;
      if(state.kind==='loading')status.textContent=`Loading ${state.asset.name} and checking its files…`;
      else if(state.kind==='ready') {
        status.textContent=`${state.asset.review_status==='needs-fix'?'Rendered — visual defect recorded':'Ready'} · ${state.asset.name} · ${state.runtime.triangleCount.toLocaleString()} triangles · ${state.runtime.primitiveCount} mesh primitives`;
        el('metrics').textContent=`${state.runtime.triangleCount.toLocaleString()} triangles · ${state.asset.inspection.materials} source materials`;
      } else {status.textContent=state.message;el('canvas').hidden=true;}
    },
  });
  const change=()=>{
    const asset=assets.find(a=>a.key===el('model').value);
    el('category').textContent=asset.category;el('name').textContent=asset.name;
    el('target').textContent=asset.renderer_target;el('review').textContent=asset.observed_issue??asset.preparation;
    el('credits').textContent=asset.authors;el('source').href=asset.source_url;
    el('licence').href=asset.licence_url;el('licence').textContent=asset.licence;
    el('metrics').textContent=asset.entry?`${(asset.files.reduce((n,f)=>n+f.bytes,0)/1048576).toFixed(1)} MiB on disk`:'';
    const clips=asset.inspection?.animations??[];
    el('note').textContent=clips.length?`Static pose only. ${clips.length} source clips are present: ${clips.join(', ')}. Animation playback needs importer work.`:
      asset.inspection?.extensions.length?`Material features to inspect: ${asset.inspection.extensions.join(', ')}.`:'Source materials under the same inspection lighting.';
    return controller.select(asset);
  };
  el('model').value=assets.find(a=>a.entry).key;
  el('model').addEventListener('change',change);
  el('model').disabled=false;
  let resizeTimer;
  const resize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(change,250);};
  win.addEventListener('resize',resize);
  const destroy=()=>{clearTimeout(resizeTimer);controller.destroy();el('model').removeEventListener('change',change);win.removeEventListener('pagehide',destroy);win.removeEventListener('resize',resize);};
  win.addEventListener('pagehide',destroy);
  await change();return {destroy};
}
