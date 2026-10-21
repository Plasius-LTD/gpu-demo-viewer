import { fixtureRequest } from './controller.js';
import { compositeStudyDefinitions } from './studies.js';

export function compositeStudies(assets) {
  return compositeStudyDefinitions().flatMap(({ placements, ...definition }) => {
    const models = placements.map(([key, anchor, size, yaw]) => ({
      asset: assets.find(a => a.key === key), anchor: [...anchor], size, yaw,
    }));
    if (models.some(model => !model.asset?.entry)) return [];
    return [{ ...definition, category: 'Composite study', models,
      inspection: { materials: models.reduce((sum, model) => sum + model.asset.inspection.materials, 0) } }];
  });
}

export function compositeRequest(study, base) {
  return { models: study.models.map(({ asset, anchor, size, yaw }) => ({
    ...fixtureRequest(asset, base), anchor, size, yaw,
  })) };
}

export function renderCompositeCredits(doc, container, models) {
  container.replaceChildren();
  for (const { asset, size } of models) {
    const item = doc.createElement('li'), source = doc.createElement('a'), licence = doc.createElement('a');
    source.textContent = `${asset.name} — ${asset.authors}`; source.href = asset.source_url;
    licence.textContent = asset.licence; licence.href = asset.licence_url;
    for (const link of [source, licence]) { link.target = '_blank'; link.rel = 'noopener'; }
    item.append(source, ' · ', licence, ` · longest dimension ${size} scene units`);
    container.append(item);
  }
}
