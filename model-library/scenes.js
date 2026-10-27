import { fixtureRequest } from './controller.js';
import { compositeStudyDefinitions, denseStudyDefinitions } from './studies.js';

export function compositeStudies(assets) {
  return resolveStudies(compositeStudyDefinitions(),assets);
}

export function denseStudies(assets) {
  return resolveStudies(denseStudyDefinitions(),assets);
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
  return { ...(study.instancing?{instancing:true,camera:study.camera}:{}), models: study.models.map(({ asset, anchor, size, yaw }) => ({
    ...fixtureRequest(asset, base), anchor, size, yaw,
  })) };
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
