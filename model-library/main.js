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
  el('sampling').value='fixed';el('samples').value='64';el('bounces').value='6';el('resolution').value='800';el('denoise').checked=true;
  const quality=()=>{
    const [width,fixedHeight]=el('resolution').value.split('x').map(Number);
    return {samplingMode:el('sampling').value,samplesPerPixel:Number(el('samples').value),maxDepth:Number(el('bounces').value),denoise:el('denoise').checked,
      width,height:fixedHeight??Math.max(1,Math.min(1440,Math.round(width*el('canvas').clientHeight/el('canvas').clientWidth)))};
  };
  const refinement=p=>{
    const adaptive=p.samplingMode==='adaptive';
    el('sample-progress').max=adaptive?(p.totalTiles??1):p.target;el('sample-progress').value=adaptive?(p.completedTiles??0):p.samples;
    const phase={complete:'Complete',paused:'Paused',rendering:'Rendering',refining:'Refining'}[p.phase];
    el('refinement').textContent=adaptive?`${phase} · ${p.completedTiles??0} / ${p.totalTiles??'…'} tiles · ${p.meanSpp?.toFixed(2)??'…'} mean SPP · ceiling ${p.target} · ${p.width} × ${p.height}`:`${phase} · ${p.samples} / ${p.target} samples · ${p.width} × ${p.height}`;
  };
  const controller=createReviewController({
    load:async(asset,signal)=>{
      const request=fixtureRequest(asset,new URL('./',win.location.href));
      el('canvas').hidden=false;
      return createModelInspection({canvas:el('canvas'),...request,signal,enabled:true,adaptiveEnabled:true,
        ...quality(),quality:quality(),
        onProgress:p=>{if(!signal.aborted)refinement(p);},
        onHintChange:visible=>{el('hint').hidden=!visible;},
        onError:error=>{if(signal.aborted)return;status.textContent=`Render failed: ${error.message}`;el('refinement').textContent='Refinement stopped';el('quality').disabled=true;}});
    },
    onState:state=>{
      el('hint').hidden=true;el('quality').disabled=state.kind!=='ready';
      if(state.kind==='loading'){el('sample-progress').value=0;el('refinement').textContent='Waiting for the first sample…';}
      if(state.kind==='loading')status.textContent=`Loading ${state.asset.name} and checking its files…`;
      else if(state.kind==='ready') {
        status.textContent=`${state.asset.review_status==='needs-fix'?'Rendered — visual defect recorded':'Ready'} · ${state.asset.name} · ${state.runtime.triangleCount.toLocaleString()} triangles · ${state.runtime.primitiveCount} mesh primitives`;
        el('metrics').textContent=`${state.runtime.triangleCount.toLocaleString()} triangles · ${state.asset.inspection.materials} source materials`;
      } else {status.textContent=state.message;el('canvas').hidden=true;el('refinement').textContent='Refinement unavailable';}
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
  const qualityChange=async()=>{
    const adaptive=el('sampling').value==='adaptive';
    el('depth-16').disabled=!adaptive;el('depth-20').disabled=!adaptive;
    if(!adaptive && Number(el('bounces').value)>12)el('bounces').value='12';
    el('sampling-note').textContent=adaptive?'Experimental radial sampling: the centre receives the ceiling, with fewer samples towards the edges. Tiles refine after the camera stops.':'Fixed sampling: every pixel progressively accumulates the selected target.';
    try{await controller.setQuality(quality());}catch(error){status.textContent=`Render failed: ${error.message}`;}
  };
  for(const id of ['sampling','samples','bounces','resolution','denoise'])el(id).addEventListener('change',qualityChange);
  const visibility=()=>controller.setPaused(doc.hidden===true);
  doc.addEventListener('visibilitychange',visibility);visibility();
  let resizeTimer;
  const resize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(qualityChange,250);};
  win.addEventListener('resize',resize);
  const destroy=()=>{for(const id of ['sampling','samples','bounces','resolution','denoise'])el(id).removeEventListener('change',qualityChange);doc.removeEventListener('visibilitychange',visibility);clearTimeout(resizeTimer);controller.destroy();el('model').removeEventListener('change',change);win.removeEventListener('pagehide',destroy);win.removeEventListener('resize',resize);};
  win.addEventListener('pagehide',destroy);
  await change();return {destroy};
}
