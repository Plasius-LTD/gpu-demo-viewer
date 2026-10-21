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
  { key: 'study-relic-collection', name: 'Relic collection',
    renderer_target: 'Compare carved stone, chess pieces and aged metal under shared light.',
    preparation: 'Inspect silhouette, surface detail and contact shadows across five originals. Dimensions are illustrative scene units.',
    placements: [
      ['gothic_statue', [-1.2, 0, -.7], 1.8, .15],
      ['marble_bust_01', [.65, 0, -.7], .85, -.25],
      ['chess_set', [0, 0, .8], 1.15, .1],
      ['kite_shield', [1.5, 0, .15], 1.15, -.4],
      ['antique_estoc', [-1.5, 0, .8], 1.25, .25],
    ] },
  { key: 'study-tool-chest', name: 'Tool-chest arrangement',
    renderer_target: 'Compare painted metal, rust and wooden handles in one working collection.',
    preparation: 'Inspect relative scale, worn surfaces and small contact shadows. These are static originals placed on a shared inspection floor.',
    placements: [
      ['metal_tool_chest', [0, 0, -.8], 1.7, 0],
      ['hand_plane_no4', [-.65, 0, .8], .5, -.25],
      ['vintage_hand_drill', [.25, 0, .9], .55, .3],
      ['rusted_spade_01', [1.25, 0, .05], 1.5, -.3],
      ['can_rusted', [-1.25, 0, .2], .4, 0],
    ] },
];

/** Independent layout data; the host resolves sources and controls access. */
export function compositeStudyDefinitions() {
  return definitions.map(({ placements, ...definition }) => ({
    ...definition,
    placements: placements.map(([key, anchor, size, yaw]) => [key, [...anchor], size, yaw]),
  }));
}
