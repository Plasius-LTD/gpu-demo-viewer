import { createReviewController, fixtureRequest, reviewEnabled } from './controller.js';
import { compositeStudies, denseStudies, compositeRequest, renderCompositeCredits } from './scenes.js';

export async function mountLibrary({document:doc=globalThis.document,window:win=globalThis.window,
  fetch:request=globalThis.fetch,importRuntime=()=>import('@plasius/gpu-shared/model-inspection')}={}) {
  const el=id=>doc.getElementById(id),status=el('status');
  if (!reviewEnabled(win.location.href)) {
    status.textContent='Local review is disabled. Open this page on localhost with ?review=first-twelve.';
    return;
  }
  const response=await request(new URL('./catalogue.json',win.location.href));
  if (!response.ok) throw new Error('Model catalogue could not be loaded.');
  const catalogue=await response.json(),assets=[...catalogue.assets,...(catalogue.benchmarkAssets??[])];
  const studies=[...compositeStudies(assets),...denseStudies(assets)], selections=[...assets,...studies];
  for(const asset of selections) {
    const option=doc.createElement('option');option.value=asset.key;
    option.textContent=asset.name+(asset.models?' — composite study':asset.entry?'':' — deferred');el('model').append(option);
  }
  const {createModelInspection,createSceneInspection}=await importRuntime();
  el('samples').value='64';el('bounces').value='6';el('resolution').value='800';el('denoise').checked=true;
  const quality=()=>{
    const [width,fixedHeight]=el('resolution').value.split('x').map(Number);
    return {samplesPerPixel:Number(el('samples').value),maxDepth:Number(el('bounces').value),denoise:el('denoise').checked,
      width,height:fixedHeight??Math.max(1,Math.min(1440,Math.round(width*el('canvas').clientHeight/el('canvas').clientWidth)))};
  };
  const refinement=p=>{
    el('sample-progress').max=p.target;el('sample-progress').value=p.samples;
    const phase={complete:'Complete',paused:'Paused',rendering:'Rendering',refining:'Refining'}[p.phase];
    el('refinement').textContent=`${phase} · ${p.samples} / ${p.target} samples · ${p.width} × ${p.height}${p.allocations?` · ${(p.allocations.allocatedBytes/1048576).toFixed(1)} MiB requested GPU storage${p.allocations.budgetBytes?` / ${(p.allocations.budgetBytes/1048576).toFixed(0)} MiB budget`:""}`:""}`;
  };
  let stateKind='loading';
  const failed=error=>{
    stateKind='error';status.textContent=`Render failed: ${error.message}`;
    el('refinement').textContent='Refinement stopped. Adjust quality, then retry.';
    el('quality').disabled=false;el('retry').hidden=false;
  };
  const controller=createReviewController({
    load:async(asset,signal)=>{
      const base=new URL('./',win.location.href);
      const request=asset.models?compositeRequest(asset,base):fixtureRequest(asset,base);
      el('canvas').hidden=false;
      const inspect=asset.models?createSceneInspection:createModelInspection;
      return inspect({canvas:el('canvas'),...request,signal,enabled:true,
        ...quality(),quality:quality(),
        onProgress:p=>{if(!signal.aborted)refinement(p);},
        onHintChange:visible=>{if(!signal.aborted)el('hint').hidden=!visible;},
        onError:error=>{if(!signal.aborted)failed(error);}});
    },
    onState:state=>{
      stateKind=state.kind;el('retry').hidden=state.kind!=='error';
      el('hint').hidden=true;el('quality').disabled=!['ready','error'].includes(state.kind);
      if(state.kind==='loading'){el('sample-progress').value=0;el('refinement').textContent='Waiting for the first sample…';}
      if(state.kind==='loading')status.textContent=`Loading ${state.asset.name} and checking its files…`;
      else if(state.kind==='ready') {
        status.textContent=`${state.asset.review_status==='needs-fix'?'Rendered — visual defect recorded':'Ready'} · ${state.asset.name} · ${state.runtime.triangleCount.toLocaleString()} triangles · ${state.runtime.primitiveCount} mesh primitives`;
        el('metrics').textContent=`${state.runtime.triangleCount.toLocaleString()} triangles · ${state.asset.inspection.materials} source materials${state.asset.models?` · ${state.asset.models.length} models + shared ground${state.runtime.geometryMode==='instanced'?` · ${state.runtime.sourceCount} unique sources · ${state.runtime.instanceCount} mesh instances · shared geometry`:""}`:''}`;
      } else {status.textContent=state.message;el('canvas').hidden=true;el('refinement').textContent='Refinement unavailable';}
    },
  });
  const change=()=>{
    const asset=selections.find(a=>a.key===el('model').value);
    el('category').textContent=asset.category;el('name').textContent=asset.name;
    el('target').textContent=asset.renderer_target;el('review').textContent=asset.observed_issue??asset.preparation;
    el('source-line').hidden=!!asset.models;el('composite-credits').hidden=!asset.models;
    el('credits').textContent=asset.models?'Sources in this study':asset.authors;
    renderCompositeCredits(doc,el('composite-credits'),asset.models??[]);
    if(!asset.models){el('source').href=asset.source_url;el('licence').href=asset.licence_url;el('licence').textContent=asset.licence;}
    el('metrics').textContent=asset.entry?`${(asset.files.reduce((n,f)=>n+f.bytes,0)/1048576).toFixed(1)} MiB on disk`:'';
    const clips=asset.inspection?.animations??[];
    el('note').textContent=asset.models?(asset.instancing?`${asset.models.length} model placements share three sources, one camera, ground and lighting. Geometry counts are unique; requested GPU storage excludes driver overhead and other tabs.`:`${asset.models.length} original models share one camera, ground and lighting. Geometry counts include the ground.`):
      clips.length?`Static pose only. ${clips.length} source clips are present: ${clips.join(', ')}. Animation playback needs importer work.`:
      asset.inspection?.extensions.length?`Material features to inspect: ${asset.inspection.extensions.join(', ')}.`:'Source materials under the same inspection lighting.';
    return controller.select(asset);
  };
  const requested=new URL(win.location.href).searchParams.get('model');
  el('model').value=selections.find(a=>a.key===requested&&(a.entry||a.models))?.key??assets.find(a=>a.entry).key;
  el('model').addEventListener('change',change);
  el('retry').addEventListener('click',change);
  el('model').disabled=false;
  const qualityChange=async()=>{
    if(stateKind!=='ready')return;
    try{await controller.setQuality(quality());}catch(error){failed(error);}
  };
  for(const id of ['samples','bounces','resolution','denoise'])el(id).addEventListener('change',qualityChange);
  const visibility=()=>controller.setPaused(doc.hidden===true);
  doc.addEventListener('visibilitychange',visibility);visibility();
  let resizeTimer;
  const resize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(qualityChange,250);};
  win.addEventListener('resize',resize);
  const destroy=()=>{for(const id of ['samples','bounces','resolution','denoise'])el(id).removeEventListener('change',qualityChange);doc.removeEventListener('visibilitychange',visibility);clearTimeout(resizeTimer);controller.destroy();el('model').removeEventListener('change',change);el('retry').removeEventListener('click',change);win.removeEventListener('pagehide',destroy);win.removeEventListener('resize',resize);};
  win.addEventListener('pagehide',destroy);
  await change();return {destroy};
}
