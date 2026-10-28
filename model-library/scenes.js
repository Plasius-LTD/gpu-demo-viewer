import { fixtureRequest } from './controller.js';
import { compositeStudyDefinitions, denseStudyDefinitions, scalableStudyDefinitions } from './studies.js';

export function compositeStudies(assets) {
  return resolveStudies(compositeStudyDefinitions(),assets);
}

export function denseStudies(assets) {
  return resolveStudies(denseStudyDefinitions(),assets);
}

export function scalableStudies(assets) {
  return scalableStudyDefinitions().flatMap(definition => {
    const sources=definition.sourceKeys.map(key=>assets.find(a=>a.key===key));
    if(sources.some(asset=>!asset?.entry))return [];
    let models;
    return [{...definition,category:'Composite study',
      inspection:{materials:sources.reduce((n,a)=>n+a.inspection.materials,0)},
      get models(){
        return models??=definition.createPlacements().map(([key,anchor,size,yaw,primitiveIndices])=>({
          asset:sources.find(a=>a.key===key),anchor,size,yaw,primitiveIndices,
        }));
      }}];
  });
}

function resolveStudies(definitions,assets) {
  return definitions.flatMap(({ placements, ...definition }) => {
    const models = placements.map(([key, anchor, size, yaw]) => ({
      asset: assets.find(a => a.key === key), anchor: [...anchor], size, yaw,
    }));
    if (models.some(model => !model.asset?.entry)) return [];
    return [{ ...definition, category: 'Composite study', models,
      inspection: { materials: [...new Map(models.map(model=>[model.asset.key,model.asset])).values()].reduce((sum, asset) => sum + asset.inspection.materials, 0) } }];
  });
}

export function compositeRequest(study, base) {
  const requests=new Map();
  return { ...(study.instancing?{instancing:true,camera:study.camera}:{}), models: study.models.map(({ asset, anchor, size, yaw, primitiveIndices }) => {
    if(!requests.has(asset.key))requests.set(asset.key,fixtureRequest(asset,base));
    return {...requests.get(asset.key),anchor,size,yaw,...(primitiveIndices?{primitiveIndices}:{} )};
  }) };
}

export function renderCompositeCredits(doc, container, models) {
  container.replaceChildren();
  const sources=new Map();
  for(const {asset,size} of models) {
    const source=sources.get(asset.key)??{asset,sizes:new Set(),count:0};
    source.sizes.add(size);source.count++;sources.set(asset.key,source);
  }
  for (const { asset, sizes, count } of sources.values()) {
    const item = doc.createElement('li'), source = doc.createElement('a'), licence = doc.createElement('a');
    source.textContent = `${asset.name} — ${asset.authors}`; source.href = asset.source_url;
    licence.textContent = asset.licence; licence.href = asset.licence_url;
    for (const link of [source, licence]) { link.target = '_blank'; link.rel = 'noopener'; }
    item.append(source, ' · ', licence, ` · ${count} placement${count===1?'':'s'} · longest dimension ${[...sizes].join(', ')} scene units`);
    container.append(item);
  }
}
