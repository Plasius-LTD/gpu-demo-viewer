import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { acquireFixtures } from '../model-library/acquire.js';
import { selectBatch } from '../model-library/rollout.js';
export async function run(acquire=acquireFixtures,batch=0) {
  const {assets}=JSON.parse(await readFile(new URL('../model-library/catalogue.json',import.meta.url),'utf8'));
  const {entries}=JSON.parse(await readFile(new URL('../model-library/rollout.json',import.meta.url),'utf8'));
  const keys=new Set(selectBatch(entries,batch).map(entry=>entry.key));
  return acquire({assets:assets.filter(asset=>keys.has(asset.key)),root:fileURLToPath(new URL('../model-library/assets/',import.meta.url))});
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(await run(undefined,process.argv[2]===undefined?0:Number(process.argv[2])));
