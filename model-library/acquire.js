import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';

export function acquisitionPlan(assets, root) {
  const plan=[];let total=0;
  for(const asset of assets) {
    if(!asset.entry) continue;
    for(const file of asset.files) {
      const url=new URL(file.url);
      if(url.protocol!=='https:' || !['dl.polyhaven.org','raw.githubusercontent.com'].includes(url.hostname)) throw new Error('Unapproved asset source.');
      const path=resolve(root,asset.key,file.path),rel=relative(resolve(root),path);
      if(!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error('Unsafe asset destination.');
      if(!Number.isSafeInteger(file.bytes)||file.bytes<1||file.bytes>100*1048576||!/^[a-f0-9]{64}$/.test(file.sha256)) throw new Error('Invalid asset bounds or hash.');
      total+=file.bytes;
      if(total>200*1048576) throw new Error('Fixture set exceeds the download budget.');
      plan.push({...file,path,asset});
    }
  }
  return plan;
}
export async function acquireFixtures({assets,root,fetch:request=globalThis.fetch}) {
  const plan=acquisitionPlan(assets,root);
  const verify=(file,data)=>data.length===file.bytes && createHash('sha256').update(data).digest('hex')===file.sha256;
  // Two sequential workers keep network and memory use bounded.
  let cursor=0;
  async function worker() {
    while(cursor<plan.length) {
      const file=plan[cursor++];let existing;
      try{existing=await readFile(file.path);}catch(error){if(error.code!=='ENOENT')throw error;}
      if(existing){if(!verify(file,existing))throw new Error(`Existing file failed integrity: ${file.asset.key}`);continue;}
      const response=await request(file.url,{redirect:'error',signal:AbortSignal.timeout(60000),headers:{'User-Agent':'Plasius-Renderer-Asset-Research/1.0 (https://plasius.co.uk)'}});
      if(!response.ok)throw new Error(`Asset download failed: ${response.status}`);
      const reader=response.body.getReader(),chunks=[];let length=0;
      try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;
        if(length>file.bytes)throw new Error('Downloaded file exceeds its reviewed byte size.');chunks.push(value);}}
      finally{await reader.cancel();}
      const data=Buffer.concat(chunks);
      if(!verify(file,data))throw new Error(`Downloaded file failed integrity: ${file.asset.key}`);
      await mkdir(resolve(file.path,'..'),{recursive:true});await writeFile(file.path,data,{flag:'wx'});
    }
  }
  const results=await Promise.allSettled([worker(),worker()]);
  const failure=results.find(r=>r.status==='rejected');if(failure)throw failure.reason;
  for(const asset of assets.filter(a=>a.entry)) {
    await writeFile(resolve(root,asset.key,'CREDITS.txt'),`${asset.name} — ${asset.authors}\n${asset.source_url}\n${asset.licence}\n${asset.licence_url}\nSource files unchanged; runtime framing only.\n`);
  }
  return {models:assets.filter(a=>a.entry).length,files:plan.length,bytes:plan.reduce((n,f)=>n+f.bytes,0)};
}
