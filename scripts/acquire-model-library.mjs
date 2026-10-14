import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { acquireFixtures } from '../model-library/acquire.js';
export async function run(acquire=acquireFixtures) {
  const {assets}=JSON.parse(await readFile(new URL('../model-library/catalogue.json',import.meta.url),'utf8'));
  return acquire({assets,root:fileURLToPath(new URL('../model-library/assets/',import.meta.url))});
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(await run());
