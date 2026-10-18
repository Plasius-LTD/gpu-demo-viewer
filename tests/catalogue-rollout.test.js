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
test('public candidates have acquired files; qualified Amber and excluded Gem are not yet live',()=>{
 const live=rollout.entries.filter(a=>a.status==='production');
 assert.equal(live.length,10);
 for(const a of live)assert.ok(installed.assets.some(b=>b.key===a.key&&b.entry&&b.files.length));
 assert.equal(rollout.entries.find(a=>a.key==='MosquitoInAmber').status,'qualified');
 assert.equal(rollout.entries.find(a=>a.key==='sf-gem').status,'excluded');
 assert.equal(rollout.productionTarget,74);
 assert.equal(rollout.entries.filter(a=>a.status!=='excluded').length,74);
 assert.equal(rollout.voxelPhase,'after-original-production-qualification');
});

test('batch one preserves six qualified Poly Haven sources without claiming production',()=>{
 const acquired=installed.assets.filter(asset=>asset.batch===1);
 assert.equal(acquired.length,6);
 const batch=selectBatch(rollout.entries,1);
 for(const asset of acquired){
  assert.equal(asset.provider,'Poly Haven');
  assert.equal(asset.licence,'CC0-1.0');
  assert.equal(batch.find(entry=>entry.key===asset.key)?.status,'qualified');
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
  assert.equal(entries.find(entry=>entry.key===asset.key)?.status,'qualified');
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
  assert.equal(rollout.entries.find(entry=>entry.key===asset.key)?.status,'qualified');
  for(const file of asset.files){assert.match(file.sha256,/^[a-f0-9]{64}$/);assert.ok(file.bytes<=20*1048576);}
 }
 for(const key of ['SheenChair','SheenCloth']){
  const asset=acquired.find(item=>item.key===key);
  assert.match(asset.source_revision,/^[a-f0-9]{40}$/);
  assert.ok(asset.files.every(file=>file.url.includes('/'+asset.source_revision+'/')));
 }
});
