import { fixtureRequest } from './controller.js';

const definitions = [
  { key: 'study-furnished-interior', name: 'Furnished interior',
    renderer_target: 'Compare woven fabric, silk, leather, wicker and aged wood in one arrangement.',
    preparation: 'Inspect relative scale, fabric response and contact shadows. Sizes are chosen scene units, not verified physical dimensions.',
    placements: [
      ['SheenWoodLeatherSofa', [0, 0, -.8], 2.4, 0],
      ['vintage_cabinet_01', [-2.15, 0, -.8], 1.7, 0],
      ['SpecularSilkPouf', [.55, 0, .85], .7, 0],
      ['wicker_basket_01', [1.6, 0, -.3], .6, 0],
    ] },
  { key: 'study-workshop', name: 'Workshop still life',
    renderer_target: 'Compare worked metal, rough timber and worn surfaces under shared light.',
    preparation: 'Inspect object contact and the contrast between brass, painted metal and timber. These are static review arrangements.',
    placements: [
      ['spinning_wheel_01', [-1.1, 0, -.65], 1.8, 0],
      ['wine_barrel_01', [1.15, 0, -.7], 1.25, 0],
      ['wooden_crate_02', [0, 0, .7], 1.2, 0],
      ['bench_vice_01', [-1.3, 0, 1.05], .55, .3],
      // Crate lid height from the original accessor bounds and lid translation,
      // uniformly scaled to its chosen 1.2-unit longest dimension.
      ['brass_blowtorch', [0, .47735, .7], .55, 0],
    ] },
];

export function compositeStudies(assets) {
  return definitions.flatMap(({ placements, ...definition }) => {
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
