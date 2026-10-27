import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { acquireFixtures } from '../model-library/acquire.js';
import { selectBatch } from '../model-library/rollout.js';
export async function run(acquire=acquireFixtures,batch=0) {
  const {assets,benchmarkAssets=[]}=JSON.parse(await readFile(new URL('../model-library/catalogue.json',import.meta.url),'utf8'));
  if(batch==='crowd')return acquire({assets:[...benchmarkAssets,...assets.filter(a=>['quiver_tree_01','searsia_lucida'].includes(a.key))],root:fileURLToPath(new URL('../model-library/assets/',import.meta.url))});
  const {entries}=JSON.parse(await readFile(new URL('../model-library/rollout.json',import.meta.url),'utf8'));
  const keys=new Set(selectBatch(entries,batch).map(entry=>entry.key));
  return acquire({assets:assets.filter(asset=>keys.has(asset.key)),root:fileURLToPath(new URL('../model-library/assets/',import.meta.url))});
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(await run(undefined,process.argv[2]===undefined?0:process.argv[2]==='crowd'?'crowd':Number(process.argv[2])));
