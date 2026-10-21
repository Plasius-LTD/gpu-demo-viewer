import test from 'node:test';
import assert from 'node:assert/strict';
import { mountLibrary } from '../model-library/main.js';
import config from '../model-library/vite.config.js';
import { run } from '../scripts/acquire-model-library.mjs';
import { readFile } from 'node:fs/promises';
const asset={key:'door',entry:'scene.gltf',name:'Door',category:'Building',renderer_target:'Wood',preparation:'Inspect',authors:'Creator',source_url:'https://example.test',licence_url:'https://example.test/licence',licence:'CC0',files:[{path:'scene.gltf',integrity:'hash',bytes:1024}],inspection:{materials:1,extensions:[],animations:[]}};
function fixture() {
  const elements=new Map(),listeners=new Map(),loads=[],changes=[];
  const doc={addEventListener:(t,f)=>listeners.set(t,f),removeEventListener:t=>listeners.delete(t),getElementById(id){if(!elements.has(id))elements.set(id,{children:[],value:'',hidden:false,clientHeight:600,clientWidth:800,
    append(o){this.children.push(o);},replaceChildren(){this.children=[];},addEventListener(t,f){this[t]=f;},removeEventListener(t){delete this[t];}});return elements.get(id);},createElement:()=>({children:[],append(...values){this.children.push(...values);}})};
  const win={location:{href:'http://localhost:5291/?review=first-twelve'},addEventListener:(t,f)=>listeners.set(t,f),removeEventListener:t=>listeners.delete(t)};
  const assets=[asset,{...asset,key:'fox',name:'Fox',inspection:{materials:1,extensions:['test'],animations:['Run']}},{...asset,key:'amber',review_status:'needs-fix',observed_issue:'Dark bands',inspection:{materials:1,extensions:['Transmission'],animations:[]}},{...asset,key:'missing',entry:null}];
  const options={document:doc,window:win,fetch:async()=>({ok:true,json:async()=>({assets})}),importRuntime:async()=>({createModelInspection:async o=>{loads.push(o);return {triangleCount:12,primitiveCount:1,destroy(){},reset(){},setQuality:async q=>changes.push(q),setPaused(){}};}})};
  return {options,doc,win,loads,listeners,changes};
}
test('page renders source credits, status, static animation caveat and deferred download',async()=>{
  const f=fixture(),runtime=await mountLibrary(f.options),el=id=>f.doc.getElementById(id);
  assert.equal(el('model').children.length,4);assert.match(el('status').textContent,/Ready · Door/);
  assert.equal(el('credits').textContent,'Creator');assert.equal(f.loads[0].height,600);
  f.loads[0].onHintChange(true);assert.equal(el('hint').hidden,false);
  f.loads[0].onError(new Error('lost'));assert.match(el('status').textContent,/lost/);
  el('model').value='fox';await el('model').change();assert.match(el('note').textContent,/Static pose only/);
  el('model').value='amber';await el('model').change();assert.match(el('note').textContent,/Transmission/);assert.match(el('status').textContent,/visual defect/);assert.equal(el('review').textContent,'Dark bands');
  el('model').value='missing';await el('model').change();assert.equal(el('canvas').hidden,true);
  f.listeners.get('pagehide')();runtime.destroy();assert.equal(f.listeners.size,0);
});
test('disabled review and unavailable catalogue stay visible before GPU allocation',async()=>{
  const f=fixture();f.win.location.href='https://example.test/?review=first-twelve';
  await mountLibrary(f.options);assert.match(f.doc.getElementById('status').textContent,/disabled/);assert.equal(f.loads.length,0);
  f.win.location.href='http://localhost/?review=first-twelve';f.options.fetch=async()=>({ok:false});
  await assert.rejects(mountLibrary(f.options),/catalogue/);
});
test('local server and acquisition entry use the checked catalogue without invoking a network in tests',async()=>{
  assert.equal(config.server.host,'127.0.0.1');assert.equal(config.server.strictPort,true);
  const result=await run(async({assets,root})=>({count:assets.filter(a=>a.entry).length,root}));
  assert.equal(result.count,11);assert.match(result.root,/model-library\/assets\/$/);
});

test('resize coalesces quality updates at the latest canvas dimensions and teardown cancels pending work',async(t)=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const f=fixture(),runtime=await mountLibrary(f.options),canvas=f.doc.getElementById('canvas');
  canvas.clientHeight=400;
  f.listeners.get('resize')();f.listeners.get('resize')();
  t.mock.timers.tick(249);assert.equal(f.loads.length,1);
  t.mock.timers.tick(1);await Promise.resolve();
  assert.equal(f.loads.length,1);assert.equal(f.changes[0].height,400);
  f.listeners.get('resize')();runtime.destroy();t.mock.timers.tick(250);
  assert.equal(f.changes.length,1);
});

test('source override stays explicit and rejects relative development paths',async()=>{
  const previous=process.env.PLASIUS_SHARED_INSPECTION_SOURCE;
  try {
    process.env.PLASIUS_SHARED_INSPECTION_SOURCE='/tmp/reviewed-package/src/model-inspection.js';
    const {default:overridden}=await import('../model-library/vite.config.js?test=absolute');
    assert.equal(overridden.resolve.alias['@plasius/gpu-shared/model-inspection'],process.env.PLASIUS_SHARED_INSPECTION_SOURCE);
    assert.ok(overridden.server.fs.allow.includes('/tmp/reviewed-package'));
    process.env.PLASIUS_SHARED_INSPECTION_SOURCE='./relative.js';
    await assert.rejects(import('../model-library/vite.config.js?test=relative'),/absolute/);
  } finally {
    if(previous===undefined)delete process.env.PLASIUS_SHARED_INSPECTION_SOURCE;
    else process.env.PLASIUS_SHARED_INSPECTION_SOURCE=previous;
  }
});

test('quality controls forward settings without reloading a model and show completed samples',async()=>{
  const f=fixture(),changes=[],pauses=[];
  f.options.importRuntime=async()=>({createModelInspection:async o=>{f.loads.push(o);return {triangleCount:12,primitiveCount:1,
    destroy(){},setQuality:async q=>changes.push(q),setPaused:p=>pauses.push(p)};}});
  const page=await mountLibrary(f.options),el=id=>f.doc.getElementById(id);
  assert.equal(f.loads[0].quality.samplesPerPixel,64);
  el('samples').value='128';el('bounces').value='10';el('resolution').value='480';el('denoise').checked=false;
  await el('samples').change();
  assert.deepEqual(changes.at(-1),{samplesPerPixel:128,maxDepth:10,width:480,height:360,denoise:false});
  assert.equal(f.loads.length,1);
  f.loads[0].onProgress({phase:'refining',samples:17,target:128,width:480,height:360});
  assert.equal(el('sample-progress').value,17);assert.match(el('refinement').textContent,/17.*128/);
  f.doc.hidden=true;f.listeners.get('visibilitychange')();assert.equal(pauses.at(-1),true);
  f.loads[0].onProgress({phase:'complete',samples:128,target:128,width:480,height:360});
  assert.match(el('refinement').textContent,/Complete/);
  page.destroy();assert.equal(f.listeners.size,0);
});

test('renderer override is explicit and rejects relative paths',async()=>{
  const previous=process.env.PLASIUS_RENDERER_SOURCE;
  try {
    process.env.PLASIUS_RENDERER_SOURCE='/tmp/reviewed-renderer/dist/index.js';
    const {default:overridden}=await import('../model-library/vite.config.js?test=renderer');
    assert.equal(overridden.resolve.alias['@plasius/gpu-renderer'],process.env.PLASIUS_RENDERER_SOURCE);
    assert.ok(overridden.server.fs.allow.includes('/tmp/reviewed-renderer'));
    process.env.PLASIUS_RENDERER_SOURCE='./relative.js';
    await assert.rejects(import('../model-library/vite.config.js?test=renderer-relative'),/absolute/);
  } finally {
    if(previous===undefined)delete process.env.PLASIUS_RENDERER_SOURCE;else process.env.PLASIUS_RENDERER_SOURCE=previous;
  }
});
test('quality failures remain visible and listeners stop updating after teardown',async()=>{
  const f=fixture();f.options.importRuntime=async()=>({createModelInspection:async()=>({triangleCount:1,primitiveCount:1,destroy(){},
    setQuality:async()=>{throw new Error('GPU unavailable');}})});
  const page=await mountLibrary(f.options);await f.doc.getElementById('bounces').change();
  assert.match(f.doc.getElementById('status').textContent,/GPU unavailable/);
  page.destroy();assert.equal(f.doc.getElementById('bounces').change,undefined);
});

test('HD through UHD presets use exact render pixels independent of viewport size',async()=>{
  const f=fixture(),page=await mountLibrary(f.options),el=id=>f.doc.getElementById(id);
  el('samples').value='1';
  for(const [preset,width,height] of [['1920x1080',1920,1080],['2560x1440',2560,1440],['3840x2160',3840,2160]]) {
    el('resolution').value=preset;await el('resolution').change();
    assert.equal(f.changes.at(-1).width,width);assert.equal(f.changes.at(-1).height,height);
    assert.equal(f.changes.at(-1).samplesPerPixel,1);
  }
  el('canvas').clientWidth=280;el('canvas').clientHeight=210;
  await el('resolution').change();assert.equal(f.changes.at(-1).width,3840);assert.equal(f.changes.at(-1).height,2160);
  page.destroy();
});

test('acquisition stays bounded to one explicitly selected batch',async()=>{
 const result=await run(async({assets})=>assets.map(asset=>asset.key),1);
 assert.equal(result.length,6);
 assert.ok(result.includes('large_iron_gate'));
 assert.ok(!result.includes('MosquitoInAmber'));
 await assert.rejects(()=>run(async()=>{},8),/batch/);
});

test('composites retain all credits and use the shared scene runtime and quality controls', async () => {
  const f=fixture(),catalogue=JSON.parse(await readFile(new URL('../model-library/catalogue.json',import.meta.url)));
  f.options.fetch=async()=>({ok:true,json:async()=>catalogue});
  const api=await f.options.importRuntime();
  f.options.importRuntime=async()=>({...api,createSceneInspection:api.createModelInspection});
  const page=await mountLibrary(f.options),el=id=>f.doc.getElementById(id);
  assert.equal(el('model').children.length,catalogue.assets.length+2);
  el('model').value='study-furnished-interior';await el('model').change();
  assert.equal(f.loads.at(-1).models.length,4);
  assert.equal(el('composite-credits').children.length,4);
  assert.match(el('composite-credits').children[0].children[0].href,/github/);
  assert.match(el('note').textContent,/4 original models/);
  assert.match(el('metrics').textContent,/4 models/);
  assert.equal(el('source-line').hidden,true);
  el('samples').value='128';await el('samples').change();
  assert.equal(f.changes.at(-1).samplesPerPixel,128);
  el('model').value='study-workshop';await el('model').change();
  assert.equal(f.loads.at(-1).models.length,5);
  el('model').value=catalogue.assets[0].key;await el('model').change();
  assert.equal(el('source-line').hidden,false);assert.equal(el('composite-credits').children.length,0);
  page.destroy();
});

test('a bookmarked study opens only a known installed selection', async () => {
  const f=fixture(),catalogue=JSON.parse(await readFile(new URL('../model-library/catalogue.json',import.meta.url)));
  f.options.fetch=async()=>({ok:true,json:async()=>catalogue});
  const api=await f.options.importRuntime();
  f.options.importRuntime=async()=>({...api,createSceneInspection:api.createModelInspection});
  f.win.location.href+='&model=study-workshop';
  const page=await mountLibrary(f.options);
  assert.equal(f.loads.length,1);assert.equal(f.loads[0].models.length,5);
  page.destroy();
  f.win.location.href='http://localhost/?review=first-twelve&model=unknown';
  const fallback=await mountLibrary(f.options);
  assert.equal(f.doc.getElementById('model').value,catalogue.assets[0].key);
  fallback.destroy();
});
