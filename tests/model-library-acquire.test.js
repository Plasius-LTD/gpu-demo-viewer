import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { acquisitionPlan, acquireFixtures } from '../model-library/acquire.js';
const data=Buffer.from('reviewed fixture');
const file={path:'scene.gltf',url:'https://dl.polyhaven.org/file/test',bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')};
const asset={key:'test',entry:'scene.gltf',files:[file],name:'Test',authors:'Creator',source_url:'https://polyhaven.com',licence:'CC0',licence_url:'https://polyhaven.com/license'};
test('acquisition rejects unreviewed sources, paths, bounds and hashes',()=>{
  for(const patch of [{url:'http://dl.polyhaven.org/test'},{url:'https://example.com/test'},{path:'../../escape'},{bytes:0},{bytes:101*1048576},{sha256:'bad'}])assert.throws(()=>acquisitionPlan([{...asset,files:[{...file,...patch}]}],'/tmp/review'));
  assert.throws(()=>acquisitionPlan([{...asset,files:Array(3).fill({...file,bytes:100*1048576})}],'/tmp/review'),/budget/);
  assert.deepEqual(acquisitionPlan([{entry:null}],'/tmp/review'),[]);
});
test('download checks integrity and size, preserves credits, reuses verified local bytes',async()=>{
  const root=await mkdtemp(join(tmpdir(),'plasius-model-acquire-'));
  try{
    let requests=0;const fetch=async()=>{requests++;return new Response(data);};
    assert.deepEqual(await acquireFixtures({assets:[asset,{entry:null}],root,fetch}),{models:1,files:1,bytes:data.length});
    assert.equal(await readFile(join(root,'test/scene.gltf'),'utf8'),data.toString());
    assert.match(await readFile(join(root,'test/CREDITS.txt'),'utf8'),/Creator/);
    await acquireFixtures({assets:[asset],root,fetch});assert.equal(requests,1);
    await writeFile(join(root,'test/scene.gltf'),'changed');
    await assert.rejects(acquireFixtures({assets:[asset],root,fetch}),/Existing file failed integrity/);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('failed and oversize downloads never become installed assets',async()=>{
  const root=await mkdtemp(join(tmpdir(),'plasius-model-reject-'));
  try{
    for(const [response,pattern] of [[new Response('missing',{status:404}),/404/],[new Response('a'.repeat(data.length+1)),/byte size/],[new Response('wrong'),/integrity/]]) {
      await assert.rejects(acquireFixtures({assets:[asset],root,fetch:async()=>response}),pattern);
      await assert.rejects(readFile(join(root,'test/scene.gltf')),/ENOENT/);
    }
  }finally{await rm(root,{recursive:true,force:true});}
});
