import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { denseStudyDefinitions } from '../model-library/studies.js';
import { denseStudies, compositeRequest, renderCompositeCredits } from '../model-library/scenes.js';
const catalogue=JSON.parse(await readFile(new URL('../model-library/catalogue.json',import.meta.url)));
const sources=[...catalogue.assets,...(catalogue.benchmarkAssets??[])];
test('fifty and one hundred astronauts retain shared source identity with full vegetation groups',()=>{
 const definitions=denseStudyDefinitions();assert.equal(definitions.length,2);
 for(const [i,d] of definitions.entries()){
  const astronauts=i?100:50;
  assert.equal(d.instancing,true);assert.deepEqual(d.camera,{eye:[25,22,33],target:[0,1,0],fov:42});
  assert.equal(d.placements.filter(p=>p[0]==='Astronaut').length,astronauts);
  assert.equal(d.placements.filter(p=>p[0]==='quiver_tree_01').length,6);
  assert.equal(d.placements.filter(p=>p[0]==='searsia_lucida').length,12);
  assert.equal(new Set(d.placements.map(p=>p[0])).size,3);
  assert.equal(new Set(d.placements.map(p=>p[1].join(','))).size,astronauts+18);
  for(const [,anchor,size,yaw] of d.placements){assert.ok(anchor.every(n=>Math.abs(n)<=20));assert.ok(size>=.25&&size<=10);assert.ok(Number.isFinite(yaw));}
 }
 definitions[0].placements[0][1][0]=999;definitions[0].camera.eye[0]=999;
 assert.notEqual(denseStudyDefinitions()[0].placements[0][1][0],999);
 assert.equal(denseStudyDefinitions()[0].camera.eye[0],25);
});
test('dense requests use instancing and distinct-source materials; missing sources hide dependent studies',()=>{
 const studies=denseStudies(sources);assert.equal(studies.length,2);
 const study=studies[1],request=compositeRequest(study,'http://localhost/');
 assert.equal(request.instancing,true);assert.deepEqual(request.camera,study.camera);assert.equal(request.models.length,118);
 assert.equal(new Set(request.models.map(m=>m.modelUrl)).size,3);
 const unique=[...new Map(study.models.map(m=>[m.asset.key,m.asset])).values()];
 assert.equal(study.inspection.materials,unique.reduce((n,a)=>n+a.inspection.materials,0));
 for(const a of unique)assert.deepEqual(denseStudies(sources.filter(s=>s.key!==a.key)),[]);
 const container={children:[],replaceChildren(){this.children=[];},append(c){this.children.push(c);}};
 const doc={createElement:()=>({children:[],append(...c){this.children.push(...c);}})};
 renderCompositeCredits(doc,container,study.models);assert.equal(container.children.length,3);
 assert.match(container.children[0].children[0].textContent,/Astronaut.*Poly/);
 assert.match(container.children[0].children.at(-1),/100 placements/);
});
test('astronaut benchmark has pinned immutable source, integrity and attribution outside original rollout',()=>{
 assert.equal(catalogue.benchmarkAssets.length,1);const a=catalogue.benchmarkAssets[0];
 assert.equal(a.key,'Astronaut');assert.equal(a.authors,'Poly');assert.equal(a.licence,'CC-BY-2.0');
 assert.equal(a.licence_url,'https://creativecommons.org/licenses/by/2.0/');
 assert.equal(a.files[0].bytes,2869044);assert.equal(a.files[0].sha256,'313d48882e2ba7bb25a340dbfd3d6f9bbc7f012372d54f518dc52e4299e3a24e');
 assert.ok(a.files[0].url.includes('/'+a.source_revision+'/'));assert.equal(a.entry,'Astronaut.glb');
 assert.ok(!catalogue.assets.some(s=>s.key===a.key));
});
