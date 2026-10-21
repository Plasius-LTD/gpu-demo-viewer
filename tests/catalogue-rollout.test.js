import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateRollout, selectBatch} from '../model-library/rollout.js';
const json=async name=>JSON.parse(await readFile(new URL(`../model-library/${name}.json`,import.meta.url),'utf8'));
const research=await json('research-catalogue'),rollout=await json('rollout'),installed=await json('catalogue');

test('all 75 distinct research identities have exactly one tracked batch',()=>{
 assert.equal(research.assets.length,75);
 assert.deepEqual(validateRollout(research.assets,rollout.entries),{total:75,first:12,remaining:63,batches:7});
 for(let batch=1;batch<=7;batch++)assert.equal(selectBatch(rollout.entries,batch).length,9);
});
test('missing, duplicate and invented identities fail validation',()=>{
 assert.throws(()=>validateRollout(research.assets,rollout.entries.slice(1)),/identity/);
 assert.throws(()=>validateRollout(research.assets,[...rollout.entries,rollout.entries[0]]),/identity/);
 assert.throws(()=>validateRollout(research.assets,rollout.entries.map((a,i)=>i===0?{...a,key:'invented'}:a)),/identity/);
});
test('invalid batches and unrecognized status cannot silently admit candidates',()=>{
 assert.throws(()=>validateRollout(research.assets,rollout.entries.map((a,i)=>i===0?{...a,batch:1}:a)),/batch/);
 assert.throws(()=>validateRollout(research.assets,rollout.entries.map((a,i)=>i===0?{...a,status:'ready-maybe'}:a)),/status/);
 assert.throws(()=>selectBatch(rollout.entries,-1),/batch/);
 assert.throws(()=>selectBatch(rollout.entries,1.5),/batch/);
 assert.throws(()=>selectBatch(rollout.entries,8),/batch/);
});
test('production records match the verified 40-model release and preserve the Gem exclusion',()=>{
 const live=rollout.entries.filter(a=>a.status==='production');
 assert.equal(live.length,40);
 for(const a of live)assert.ok(installed.assets.some(b=>b.key===a.key&&b.entry&&b.files.length));
 assert.equal(rollout.entries.find(a=>a.key==='MosquitoInAmber').status,'production');
 assert.equal(rollout.entries.find(a=>a.key==='sf-gem').status,'excluded');
 assert.equal(rollout.productionTarget,74);
 assert.equal(rollout.entries.filter(a=>a.status!=='excluded').length,74);
 assert.equal(rollout.voxelPhase,'after-original-production-qualification');
});

test('batch one preserves six production-verified Poly Haven sources',()=>{
 const acquired=installed.assets.filter(asset=>asset.batch===1);
 assert.equal(acquired.length,6);
 const batch=selectBatch(rollout.entries,1);
 for(const asset of acquired){
  assert.equal(asset.provider,'Poly Haven');
  assert.equal(asset.licence,'CC0-1.0');
  assert.equal(batch.find(entry=>entry.key===asset.key)?.status,'production');
  assert.ok(asset.entry&&asset.files.length);
  for(const file of asset.files)assert.match(file.sha256,/^[a-f0-9]{64}$/);
 }
});

test('batch two admits five bounded sources and holds oversized original trees for LOD work',()=>{
 const acquired=installed.assets.filter(asset=>asset.batch===2);
 assert.equal(acquired.length,5);
 const entries=selectBatch(rollout.entries,2);
 for(const asset of acquired){
  assert.ok(asset.entry&&asset.files.length);
  assert.equal(entries.find(entry=>entry.key===asset.key)?.status,'production');
 }
 for(const key of ['fir_tree_01','island_tree_01','jacaranda_tree','pine_tree_01']){
  assert.equal(entries.find(entry=>entry.key===key)?.status,'held');
  assert.ok(!acquired.some(asset=>asset.key===key));
 }
});


test('batch three preserves nine original sources with verified resources and source identities',()=>{
 const acquired=installed.assets.filter(asset=>asset.batch===3);
 assert.equal(acquired.length,9);
 for(const asset of acquired){
  assert.ok(asset.entry&&asset.files.length);
  assert.equal(asset.licence,'CC0-1.0');
  assert.equal(rollout.entries.find(entry=>entry.key===asset.key)?.status,'production');
  for(const file of asset.files){assert.match(file.sha256,/^[a-f0-9]{64}$/);assert.ok(file.bytes<=20*1048576);}
 }
 for(const key of ['SheenChair','SheenCloth']){
  const asset=acquired.find(item=>item.key===key);
  assert.match(asset.source_revision,/^[a-f0-9]{40}$/);
  assert.ok(asset.files.every(file=>file.url.includes('/'+asset.source_revision+'/')));
 }
});

test('batch four qualifies original furniture and workshop sources with bounded texture inventories',async()=>{
 const acquired=installed.assets.filter(asset=>asset.batch===4);
 assert.deepEqual(acquired.map(asset=>asset.key).sort(),[
  'SheenWoodLeatherSofa','SpecularSilkPouf','spinning_wheel_01','vintage_cabinet_01',
  'wicker_basket_01','wine_barrel_01','bench_vice_01','brass_blowtorch','Camera_01',
 ].sort());
 for(const asset of acquired){
  assert.equal(rollout.entries.find(entry=>entry.key===asset.key)?.status,'production');
  assert.ok(asset.entry&&asset.files.some(file=>file.path===asset.entry));
  for(const file of asset.files){assert.match(file.sha256,/^[a-f0-9]{64}$/);assert.ok(file.bytes<=20*1048576);}
 }
 const sofa=acquired.find(asset=>asset.key==='SheenWoodLeatherSofa');
 assert.ok(sofa.inspection.extensions.includes('EXT_texture_webp'));
 assert.ok(sofa.files.some(file=>file.path.endsWith('.webp')));
 const evidence=JSON.parse(await readFile(new URL('../docs/batch-four-qualification.json',import.meta.url),'utf8'));
 assert.equal(evidence.registryConsumptionVerified,true);
 assert.equal(evidence.productionVerified,false);
 assert.equal(evidence.models.length,9);
 for(const model of evidence.models){
  assert.equal(model.completedFixedSamples,64);
  assert.equal(model.cameraResetAndRefinement,true);
  assert.equal(model.denoisingOffOn,true);
  assert.deepEqual(model.completedUhd,{width:3840,height:2160,samples:1});
 }
});


test('batch five preserves the nine original tool and material sources with registry qualification',async()=>{
 const assets=installed.assets.filter(asset=>asset.batch===5);
 assert.deepEqual(assets.map(asset=>asset.key).sort(),[
  'can_rusted','circuit_board','FlightHelmet','hand_plane_no4','metal_tool_chest',
  'rusted_spade_01','vintage_hand_drill','WaterBottle','antique_estoc',
 ].sort());
 assert.equal(assets.flatMap(asset=>asset.files).length,58);
 assert.equal(assets.flatMap(asset=>asset.files).reduce((n,file)=>n+file.bytes,0),75722699);
 for(const asset of assets){
  assert.equal(asset.licence,'CC0-1.0');
  assert.ok(asset.entry&&asset.files.some(file=>file.path===asset.entry));
  assert.equal(rollout.entries.find(entry=>entry.key===asset.key)?.status,'qualified');
  assert.equal(asset.review_status,'qualified');
  for(const file of asset.files){assert.match(file.sha256,/^[a-f0-9]{64}$/);assert.ok(file.bytes<=100*1048576);}
 }
 assert.ok(assets.find(a=>a.key==='FlightHelmet').inspection.extensions.includes('KHR_materials_transmission'));
 assert.ok(assets.find(a=>a.key==='circuit_board').inspection.alphaModes.includes('BLEND'));
 assert.equal(installed.assets.filter(a=>a.batch>5).length,0);
 const evidence=JSON.parse(await readFile(new URL('../docs/batch-five-qualification.json',import.meta.url),'utf8'));
 assert.equal(evidence.registryConsumptionVerified,true);
 assert.equal(evidence.initialSourceOverrides,false);
 assert.equal(evidence.productionVerified,false);
 assert.deepEqual(evidence.models.map(a=>a.key).sort(),assets.map(a=>a.key).sort());
 for(const model of evidence.models){
  assert.equal(model.completedFixedSamples,64);
  assert.equal(model.cameraResetAndRefinement,true);
  assert.equal(model.denoisingOffOn,true);
  assert.deepEqual(model.completedUhd,{width:3840,height:2160,samples:1});
  assert.ok(model.evidence.length>=3);
 }
 assert.equal(evidence.layout320.scrollWidth,320);
});
