import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeedbackPanel } from '../diagnostics/panel.js';
import { mountFeedbackLifecycle } from '../diagnostics/lifecycle.js';
import { createCuratedShowcaseSource } from '../diagnostics/source.js';
import { showcaseAssetIntegrity } from '../diagnostics/assets.js';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createFeedbackGameDiagnosticSnapshot } from '@plasius/gpu-renderer';
const safePacket = () => createFeedbackGameDiagnosticSnapshot({featureEnabled:true,capabilityGranted:true,consentConfirmed:true,surfaceId:'site.gpu-demo',renderer:'webgpu',backend:'browser',viewportWidth:960,viewportHeight:540,frameRate:undefined,frameTimeMs:undefined,featureIds:['renderer.frame-loop'],counters:[],errorCodes:[]});

test('the public boundary and reviewed asset bytes are pinned to the released package', async () => {
  const api=await import('@plasius/gpu-demo-viewer/feedback-diagnostics');
  assert.deepEqual(Object.keys(api),['mountDiagnosticShowcase']);
  await assert.rejects(import('@plasius/gpu-demo-viewer/diagnostics/lifecycle.js'),{code:'ERR_PACKAGE_PATH_NOT_EXPORTED'});
  const manifest=JSON.parse(readFileSync(new URL('../package.json',import.meta.url)));
  assert.ok(manifest.files.includes('diagnostics/'));assert.equal(manifest.dependencies['@plasius/gpu-shared'],'1.4.0');
  for(const [key,digest] of Object.entries(showcaseAssetIntegrity)) {
    const bytes=readFileSync(import.meta.resolve(`@plasius/gpu-shared/assets/${key}.gltf`).replace('file://',''));
    assert.equal(digest,'sha384-'+createHash('sha384').update(bytes).digest('base64'));
    const model=JSON.parse(bytes);
    for(const resource of [...(model.buffers??[]),...(model.images??[])]) {
      if(resource.uri)assert.match(resource.uri,/^data:/,'No unpinned external resource');
    }
  }
  for(const name of ['index','panel','source','lifecycle']) {
    const code=readFileSync(new URL(`../diagnostics/${name}.js`,import.meta.url),'utf8');
    assert.doesNotMatch(code,/\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB|caches|toDataURL|toBlob|getImageData|getDisplayMedia|render_game_to_text)\b/);
  }
});

function fixture() {
  const elements = [];
  const document = {createElement(tag) {
    const e = {tag, children: [], textContent: '', hidden: false, disabled: false,
      checked: false, value: '', listeners: new Map(),
      append(...children) { this.children.push(...children); },
      setAttribute(k,v) { this[k]=v; },
      addEventListener(k,v) { this.listeners.set(k,v); },
      removeEventListener(k) { this.listeners.delete(k); },
      remove() { this.removed=true; },
      focus() { this.focused=true; }, select() { this.selected=true; }};
    elements.push(e);return e;
  }};
  const root=document.createElement('div');
  return {root, document, elements, get:tag=>elements.find(e=>e.tag===tag),
    button:text=>elements.find(e=>e.tag==='button'&&e.textContent===text)};
}

const granted = {featureEnabled:true,capabilityGranted:true,sceneEnabled:true};
const ready = () => ({state:{assetCatalog:{mode:'modeled-baseline',fallbackReason:null},
  nativeRenderer:{backend:'webgpu-raster',width:960,height:540,submittedFrames:1},rendererUnavailable:false},destroy(){}});

test('only the fixed source mount can produce a schema-backed observation after consent', async () => {
  const runtime=ready(), mounts=[];
  const source=await createCuratedShowcaseSource({root:{},sceneEnabled:true,
    loadShared:async()=>({mountGpuShowcase:async options=>{mounts.push(options);return runtime;},resolveShowcaseAssetUrl:key=>new URL(`https://assets.test/${key}.gltf`)})});
  assert.equal(await source.observe(false),null);
  const packet=await source.observe(true);
  assert.equal(packet.surfaceId,'site.gpu-demo');
  assert.equal(packet.provenanceContractId,'gpu-demo.renderer-diagnostics.v1');
  assert.equal(packet.renderer,'webgpu');assert.equal(packet.viewportBucket,'small-landscape');
  assert.equal(packet.frameRateBucket,'unknown');assert.equal(packet.frameTimeBucket,'unknown');
  assert.deepEqual(packet.counters,[]);assert.deepEqual(packet.errorCodes,[]);
  assert.equal(mounts.length,1);assert.equal(mounts[0].focus,'integrated');
  assert.equal(mounts[0].__featureFlags.gpu_showcase_realistic_models_v1,false);
  assert.equal(Object.keys(mounts[0].gltfLoadOptions.integrity).length,4);
  assert.ok(Object.values(mounts[0].gltfLoadOptions.integrity).every(x=>/^sha384-/.test(x)));
  runtime.state.name='SECRET_NAME';runtime.state.url='https://secret.test/private';
  Object.defineProperty(runtime.state,'canvas',{get(){throw new Error('pixel read');}});
  Object.defineProperty(runtime.state,'lastDecision',{get(){throw new Error('raw telemetry read');}});
  assert.doesNotMatch(JSON.stringify(await source.observe(true)),/SECRET|secret|canvas|coordinate|warning/);
  source.destroy();assert.equal(await source.observe(true),null);source.destroy();
});

test('source rejects missing, fallback, unrendered, unavailable or mutated provenance', async () => {
  for(const mutate of [r=>{r.state.assetCatalog.mode='legacy-fallback';},r=>{r.state.assetCatalog.fallbackReason='PRIVATE_WARNING';},
    r=>{r.state.nativeRenderer=null;},r=>{r.state.nativeRenderer.backend='canvas2d';},
    r=>{r.state.nativeRenderer.submittedFrames=0;},r=>{r.state.rendererUnavailable=true;},r=>{r.state=null;}]) {
    const runtime=ready();const source=await createCuratedShowcaseSource({root:{},sceneEnabled:true,
      loadShared:async()=>({mountGpuShowcase:async()=>runtime,resolveShowcaseAssetUrl:k=>new URL(`https://assets.test/${k}`)})});
    mutate(runtime);assert.equal(await source.observe(true),null);source.destroy();
  }
  let loaded=false;
  const source=await createCuratedShowcaseSource({root:{},sceneEnabled:false,loadShared:async()=>{loaded=true;}});
  assert.equal(loaded,false);assert.equal(await source.observe(true),null);source.destroy();
});

test('panel is explicit, labelled, consented, revocable and does not copy without a fresh grant', async () => {
  const f=fixture();let access={...granted},reads=0,copied=[];
  const source={observe(consent){assert.equal(consent,true);reads++;return safePacket();}};
  const panel=createFeedbackPanel({root:f.root,document:f.document,source,
    resolveAccess:async()=>access,copy:async text=>copied.push(text)});
  const consent=f.get('input'),preview=f.get('textarea'),prepare=f.button('Preview diagnostics'),copy=f.button('Copy diagnostics');
  assert.equal(reads,0);assert.equal(consent.checked,false);assert.equal(copy.disabled,true);
  assert.equal(consent.type,'checkbox');assert.equal(preview.readOnly,true);
  await prepare.listeners.get('click')();assert.equal(reads,0);
  consent.checked=true;consent.listeners.get('change')();await prepare.listeners.get('click')();
  assert.equal(reads,1);assert.match(preview.value,/small-landscape/);assert.equal(copy.disabled,false);
  access={...granted,capabilityGranted:false};await copy.listeners.get('click')();
  assert.equal(copied.length,0);assert.equal(preview.value,'');assert.equal(consent.checked,false);
  access={...granted};consent.checked=true;consent.listeners.get('change')();await prepare.listeners.get('click')();
  await copy.listeners.get('click')();assert.deepEqual(copied,[JSON.stringify(safePacket(),null,2)]);
  consent.checked=false;consent.listeners.get('change')();assert.equal(preview.value,'');assert.equal(copy.disabled,true);
  panel.destroy();assert.equal(f.get('section').removed,true);assert.equal(prepare.listeners.size,0);
});

test('denial, resolver errors, invalid sources and clipboard failures use fixed safe states', async () => {
  for(const decision of [{...granted,featureEnabled:false},{...granted,sceneEnabled:false},null,undefined,
    {...granted,capabilityGranted:'true'},new Error('SECRET_NAME')]) {
    const f=fixture();let reads=0;
    const panel=createFeedbackPanel({root:f.root,document:f.document,source:{observe(){reads++;throw new Error('PRIVATE');}},
      resolveAccess:async()=>{if(decision instanceof Error)throw decision;return decision;},copy:async()=>{throw new Error('PRIVATE');}});
    f.get('input').checked=true;await f.button('Preview diagnostics').listeners.get('click')();
    assert.equal(reads,0);assert.equal(f.get('textarea').value,'');
    assert.ok(f.elements.every(e=>!String(e.textContent).includes('SECRET')));panel.destroy();
  }
  for(const observe of [()=>null,()=>{throw new Error('PRIVATE_WARNING');}]) {
    const f=fixture();const panel=createFeedbackPanel({root:f.root,document:f.document,source:{observe},resolveAccess:async()=>granted});
    f.get('input').checked=true;await f.button('Preview diagnostics').listeners.get('click')();
    assert.equal(f.get('textarea').value,'');assert.equal(f.button('Copy diagnostics').disabled,true);panel.destroy();
  }
});

test('consent changes, refresh, disposal and overlapping actions cancel delayed results', async () => {
  const f=fixture();let release,reads=0;
  const panel=createFeedbackPanel({root:f.root,document:f.document,source:{observe(){reads++;return {}; }},
    resolveAccess:()=>new Promise(resolve=>{release=resolve;})});
  const prepare=f.button('Preview diagnostics'),consent=f.get('input');
  consent.checked=true;const pending=prepare.listeners.get('click')();
  consent.checked=false;consent.listeners.get('change')();release(granted);await pending;
  assert.equal(reads,0);
  consent.checked=true;const second=prepare.listeners.get('click')();panel.destroy();release(granted);await second;
  assert.equal(reads,0);assert.equal(f.get('textarea').value,'');
});

test('source rechecks lifetime and consent before observing after a delayed renderer import', async () => {
  let release, current=true;
  const runtime=ready();
  Object.defineProperty(runtime.state.nativeRenderer,'width',{get(){throw new Error('No observation after revocation');}});
  const source=await createCuratedShowcaseSource({root:{},sceneEnabled:true,
    loadShared:async()=>({mountGpuShowcase:async()=>runtime,resolveShowcaseAssetUrl:k=>new URL(`https://assets.test/${k}`)}),
    loadRenderer:()=>new Promise(resolve=>{release=resolve;})});
  const pending=source.observe(true,()=>current);current=false;release({createFeedbackGameDiagnosticSnapshot});
  assert.equal(await pending,null);assert.equal(await source.observe(true,()=>false),null);
  current=true;const second=source.observe(true);source.destroy();release({createFeedbackGameDiagnosticSnapshot});
  assert.equal(await second,null);
});

test('controls are hidden without remote grants and refresh fails closed across races and teardown', async () => {
  const f=fixture();let access=granted;
  const panel=createFeedbackPanel({root:f.root,document:f.document,source:{observe:()=>safePacket()},resolveAccess:async()=>access});
  assert.equal(f.get('section').hidden,true);await panel.refreshAccess();assert.equal(f.get('section').hidden,false);
  access={...granted,featureEnabled:false};await panel.refreshAccess();assert.equal(f.get('section').hidden,true);
  panel.destroy();access=granted;await panel.refreshAccess();assert.equal(f.get('section').hidden,true);
  const g=fixture();let release;
  const pendingPanel=createFeedbackPanel({root:g.root,document:g.document,source:{},resolveAccess:()=>new Promise(r=>{release=r;})});
  const pending=pendingPanel.refreshAccess();pendingPanel.destroy();release(granted);await pending;
  assert.equal(g.get('section').hidden,true);
  const h=fixture();const failed=createFeedbackPanel({root:h.root,document:h.document,source:{},resolveAccess:async()=>{throw Error('PRIVATE');}});
  await failed.refreshAccess();assert.equal(h.get('section').hidden,true);failed.destroy();
});

test('panel rejects wider source output and handles changed packets or unavailable clipboard', async () => {
  for(const output of [{...safePacket(),name:'SECRET'},safePacket()]) {
    const f=fixture();let value=output;
    const panel=createFeedbackPanel({root:f.root,document:f.document,source:{observe:()=>value},
      resolveAccess:async()=>granted,copy:async()=>{throw new Error('SECRET');}});
    const consent=f.get('input'),prepare=f.button('Preview diagnostics'),copy=f.button('Copy diagnostics');
    await copy.listeners.get('click')();consent.checked=true;await prepare.listeners.get('click')();
    if(output.name)assert.equal(copy.disabled,true);
    else {
      await copy.listeners.get('click')();assert.ok(f.elements.some(e=>String(e.textContent).includes('Select the preview text')));
      value={...safePacket(),viewportBucket:'large-landscape'};
      await copy.listeners.get('click')();assert.equal(f.get('textarea').value,'');
      await prepare.listeners.get('click')();value=null;await copy.listeners.get('click')();assert.equal(copy.disabled,true);
      panel.refreshAccess();assert.equal(consent.checked,false);
    }
    assert.ok(f.elements.every(e=>!String(e.textContent).includes('SECRET')));panel.destroy();panel.destroy();
    await prepare.listeners.get('click')?.();
  }
});

test('public mount rejects arbitrary surfaces, route aliases and player-system; missing decisions deny', async () => {
  const {mountDiagnosticShowcase}=await import('../diagnostics/index.js');
  for(const options of [null,{},[],{root:{},feedbackRoot:{},resolveAccess:true},
    {root:{},feedbackRoot:{},resolveAccess(){},surfaceId:'site.player-system'}]) {
    await assert.rejects(mountDiagnosticShowcase(options),/Invalid diagnostics mount/);
  }
  const f=fixture(),oldLocation=globalThis.location,oldDocument=globalThis.document;
  globalThis.document=f.document;
  try {
    const options={root:f.root,feedbackRoot:f.root,resolveAccess:async()=>({})};
    for(const pathname of ['/player-system','/player-system/','/generator','/gpu-demo/other','/gpu-demo-viewer/model-library/']) {
      globalThis.location={pathname};await assert.rejects(mountDiagnosticShowcase(options),/not registered/);
    }
    globalThis.location={pathname:'/gpu-demo'};
    const handle=await mountDiagnosticShowcase(options);assert.equal(f.get('input').checked,false);
    assert.deepEqual(Object.keys(handle),['refreshAccess','destroy']);handle.refreshAccess();handle.destroy();
    const unavailable=await mountDiagnosticShowcase({...options,resolveAccess:async()=>{throw Error('PRIVATE');}});unavailable.destroy();
    await assert.rejects(mountDiagnosticShowcase({...options,feedbackRoot:{}}),/could not be mounted/);
  } finally {globalThis.location=oldLocation;globalThis.document=oldDocument;}
});

test('public access recovery requires a remount when the initial scene source was absent', async () => {
  const {mountDiagnosticShowcase}=await import('../diagnostics/index.js');
  const oldLocation=globalThis.location,oldDocument=globalThis.document;
  globalThis.location={pathname:'/gpu-demo'};
  try {
    for(const initial of [undefined,{...granted,sceneEnabled:false},new Error('PRIVATE')]) {
      const f=fixture();globalThis.document=f.document;let access=initial;
      const viewer=await mountDiagnosticShowcase({root:f.root,feedbackRoot:f.root,
        resolveAccess:async()=>{if(access instanceof Error)throw access;return access;}});
      assert.equal(f.get('section').hidden,true);
      access=granted;
      const result=await viewer.refreshAccess();
      assert.equal(f.get('section').hidden,true,'a new grant must not reveal a permanently absent source');
      assert.deepEqual(result,{status:'remount-required'});
      assert.equal(f.get('input').checked,false);assert.equal(f.get('textarea').value,'');
      viewer.destroy();
    }
  } finally {globalThis.location=oldLocation;globalThis.document=oldDocument;}
});

test('delayed source mount rechecks access and ends a revoked scene lifetime', async () => {
  const previous=globalThis.document;
  try {
    for(const decision of [{...granted,sceneEnabled:false},new Error('PRIVATE'),{...granted,capabilityGranted:false},granted]) {
      const f=fixture();globalThis.document=f.document;
      let access=granted,release,started,disposed=0,reads=0;
      const mounting=new Promise(resolve=>{started=resolve;});
      const pending=mountFeedbackLifecycle({root:f.root,feedbackRoot:f.root,resolveAccess:async()=>{
        reads++;if(access instanceof Error)throw access;return access;
      },createSource:async({sceneEnabled})=>{
        assert.equal(sceneEnabled,true);started();await new Promise(resolve=>{release=resolve;});
        return {observe:()=>safePacket(),destroy(){disposed++;}};
      }});
      await mounting;access=decision;release();const viewer=await pending;
      assert.equal(reads,2,'access must be rechecked after the asynchronous mount');
      assert.equal(f.get('section').hidden,decision!==granted);
      const sceneRevoked=decision instanceof Error || decision.sceneEnabled===false;
      assert.equal(disposed,sceneRevoked?1:0);
      access=granted;assert.deepEqual(await viewer.refreshAccess(),{status:sceneRevoked?'remount-required':'available'});
      viewer.destroy();assert.equal(f.get('section').removed,true);
    }
  } finally {globalThis.document=previous;}
});

test('source-backed refreshes reject stale grants, clear consent and dispose pending work', async () => {
  const f=fixture(),previous=globalThis.document;globalThis.document=f.document;
  try {
    let access=granted,disposed=0;const waiters=[];
    const viewer=await mountFeedbackLifecycle({root:f.root,feedbackRoot:f.root,resolveAccess:async()=>access,
      createSource:async()=>({observe:()=>safePacket(),destroy(){disposed++;}})});
    assert.equal(f.get('section').hidden,false);
    f.get('input').checked=true;await f.button('Preview diagnostics').listeners.get('click')();
    assert.notEqual(f.get('textarea').value,'');
    access=new Promise(resolve=>waiters.push(resolve));const older=viewer.refreshAccess();
    access={...granted,featureEnabled:false};const newer=viewer.refreshAccess();await newer;
    waiters.shift()(granted);assert.deepEqual(await older,{status:'superseded'});
    assert.equal(f.get('section').hidden,true);assert.equal(f.get('input').checked,false);
    assert.equal(f.get('textarea').value,'');assert.equal(disposed,0);
    access=granted;assert.deepEqual(await viewer.refreshAccess(),{status:'available'});
    access=new Promise(resolve=>waiters.push(resolve));const pending=viewer.refreshAccess();
    viewer.destroy();waiters.shift()({...granted,sceneEnabled:false});assert.deepEqual(await pending,{status:'disposed'});
    assert.deepEqual(await viewer.refreshAccess(),{status:'disposed'});
    assert.equal(f.get('section').hidden,true);assert.equal(f.get('section').removed,true);assert.equal(disposed,1);
  } finally {globalThis.document=previous;}
});

test('scene revocation requires remount; failed UI mounting releases the private source', async () => {
  const previous=globalThis.document;const f=fixture();globalThis.document=f.document;
  try {
    let access=granted,disposed=0;
    const options={root:f.root,feedbackRoot:f.root,resolveAccess:async()=>access,
      createSource:async()=>({observe:()=>safePacket(),destroy(){disposed++;}})};
    const viewer=await mountFeedbackLifecycle(options);
    access={...granted,sceneEnabled:false};assert.deepEqual(await viewer.refreshAccess(),{status:'unavailable'});
    assert.equal(disposed,1);access=granted;
    assert.deepEqual(await viewer.refreshAccess(),{status:'remount-required'});
    assert.equal(f.get('section').hidden,true);viewer.destroy();
    await assert.rejects(mountFeedbackLifecycle({...options,feedbackRoot:{}}),/could not be mounted/);
    assert.equal(disposed,3);
  } finally {globalThis.document=previous;}
});

test('a superseded scene denial cannot dispose the source behind a newer successful refresh', async () => {
  const f=fixture(),previous=globalThis.document;globalThis.document=f.document;
  try {
    let access=granted,release,disposed=0;
    const viewer=await mountFeedbackLifecycle({root:f.root,feedbackRoot:f.root,resolveAccess:async()=>access,
      createSource:async()=>({observe:()=>safePacket(),destroy(){disposed++;}})});
    access=new Promise(resolve=>{release=resolve;});const older=viewer.refreshAccess();
    access=granted;assert.deepEqual(await viewer.refreshAccess(),{status:'available'});
    release({...granted,sceneEnabled:false});assert.deepEqual(await older,{status:'superseded'});
    assert.equal(disposed,0,'a superseded denial must have no destructive side effects');
    assert.equal(f.get('section').hidden,false);
    assert.deepEqual(await viewer.refreshAccess(),{status:'available'});
    f.get('input').checked=true;await f.button('Preview diagnostics').listeners.get('click')();
    assert.notEqual(f.get('textarea').value,'');viewer.destroy();assert.equal(disposed,1);
  } finally {globalThis.document=previous;}
});
