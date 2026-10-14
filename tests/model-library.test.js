import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createReviewController, fixtureRequest, reviewEnabled } from '../model-library/controller.js';
const asset={key:'door',entry:'door.gltf',files:[{path:'door.gltf',integrity:'sha256-example'}]};
test('local review is explicit and cannot expose a production route',()=>{
  assert.equal(reviewEnabled('http://localhost:5291/?review=first-twelve'),true);
  assert.equal(reviewEnabled('http://127.0.0.1:5291/?review=first-twelve'),true);
  assert.equal(reviewEnabled('https://plasius.co.uk/?review=first-twelve'),false);
  assert.equal(reviewEnabled('http://localhost/'),false);
});
test('fixture paths remain inside their own directory',()=>{
  const r=fixtureRequest(asset,'http://localhost/model-library/');
  assert.equal(r.modelUrl,'http://localhost/model-library/assets/door/door.gltf');
  assert.equal(r.integrity[r.modelUrl],'sha256-example');
  for(const a of [{...asset,key:'../secret'},{...asset,entry:'/secret'},
    {...asset,files:[{path:'../secret',integrity:'x'}]}]) assert.throws(()=>fixtureRequest(a,'http://localhost/'));
});
test('switching cancels old load, destroys stale renderer and reports only newest selection',async()=>{
  const states=[],pending=[];let destroyed=0;
  const c=createReviewController({load:(a,signal)=>new Promise(resolve=>pending.push({signal,resolve})),onState:s=>states.push(s)});
  const a=c.select(asset),b=c.select({...asset,key:'other'});
  assert.equal(pending[0].signal.aborted,true);
  pending[0].resolve({destroy:()=>destroyed++});await a;
  pending[1].resolve({triangleCount:1,destroy:()=>destroyed++,reset:()=>destroyed++});await b;
  assert.equal(states.at(-1).kind,'ready');assert.equal(destroyed,1);
  c.reset();c.destroy();c.destroy();assert.equal(destroyed,3);
});
test('pending download and renderer errors remain visible',async()=>{
  const states=[];let count=0;
  const c=createReviewController({load:async()=>{count++;throw Error('Integrity mismatch');},onState:s=>states.push(s)});
  await c.select({...asset,entry:null});assert.equal(states.at(-1).kind,'missing');assert.equal(count,0);
  await c.select(asset);assert.equal(states.at(-1).kind,'error');assert.match(states.at(-1).message,/Integrity mismatch/);
  c.reset();c.destroy();await c.select(asset);assert.equal(count,1);
});
test('all twelve exact shortlisted identities retain licensing and provenance',async()=>{
  const {assets}=JSON.parse(await readFile(new URL('../model-library/catalogue.json',import.meta.url)));
  assert.equal(assets.length,12);assert.equal(new Set(assets.map(a=>a.key)).size,12);
  for(const a of assets){assert.ok(a.source_url&&a.authors&&a.licence_url);if(a.entry){assert.ok(a.files.length);for(const f of a.files)assert.match(f.sha256,/^[a-f0-9]{64}$/);}}
  assert.deepEqual(assets.find(a=>a.key==='Fox').inspection.animations,['Survey','Walk','Run']);
  assert.equal(assets.filter(a=>a.entry).length,11);
  const house=assets.find(a=>a.key==='sf-house');
  assert.equal(house.entry,'medieval_house.glb');
  assert.equal(house.files[0].acquisition,'manual');
  assert.equal(house.files[0].url,undefined);
  assert.equal(house.licence,'CC-BY-4.0');
  assert.equal(house.authors,'Vanuartw');
  assert.equal(house.inspection.triangles,83046);
  assert.equal(assets.find(a=>a.key==='sf-gem').entry,null);
});

test('a cancelled quality update cannot overwrite the next model state',async()=>{
  let rejectQuality;
  const states=[];
  const controller=createReviewController({onState:s=>states.push(s),load:async()=>({destroy(){},setQuality:()=>new Promise((resolve,reject)=>{rejectQuality=reject;})})});
  await controller.select(asset);
  const quality=controller.setQuality({maxDepth:8});
  await controller.select({...asset,key:'new-model'});
  rejectQuality(new Error('old render cancelled'));await quality;
  assert.equal(states.at(-1).asset.key,'new-model');assert.equal(states.at(-1).kind,'ready');
  controller.destroy();
});

test('experimental depth options are present and unavailable in initial fixed mode',async()=>{
 const html=await readFile(new URL('../model-library/index.html',import.meta.url),'utf8');
 for(const value of [16,20])assert.match(html,new RegExp(`<option id="depth-${value}"[^>]*disabled[^>]*>${value}</option>`));
});
