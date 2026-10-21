import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compositeStudies, compositeRequest } from '../model-library/scenes.js';

const { assets } = JSON.parse(await readFile(new URL('../model-library/catalogue.json', import.meta.url)));
test('four distinct studies use installed originals with complete manifests and recorded placement', () => {
  const studies = compositeStudies(assets);
  assert.equal(studies.length, 4);
  for (const study of studies) {
    assert.ok(study.models.length >= 3 && study.models.length <= 6);
    const request = compositeRequest(study, 'http://localhost:5291/');
    assert.equal(request.models.length, study.models.length);
    for (let i = 0; i < request.models.length; i++) {
      const model = request.models[i], source = study.models[i].asset;
      assert.equal(Object.keys(model.integrity).length, source.files.length);
      assert.ok(model.integrity[model.modelUrl]);
      assert.ok(source.authors && source.licence_url && source.source_url);
      assert.ok(model.size >= .25);
      assert.equal(model.anchor.length, 3);
      assert.ok(model.anchor[1] >= 0);
    }
  }
});
test('relic and tool studies contain only their complete qualified original source sets', () => {
  const studies = compositeStudies(assets);
  const expected = {
    'study-relic-collection': ['gothic_statue', 'marble_bust_01', 'chess_set', 'kite_shield', 'antique_estoc'],
    'study-tool-chest': ['metal_tool_chest', 'hand_plane_no4', 'vintage_hand_drill', 'rusted_spade_01', 'can_rusted'],
  };
  for (const [key, sources] of Object.entries(expected)) {
    assert.deepEqual(studies.find(study => study.key === key)?.models.map(model => model.asset.key), sources);
    for (const missing of sources) {
      const remaining = compositeStudies(assets.filter(asset => asset.key !== missing));
      assert.ok(!remaining.some(study => study.key === key));
      assert.equal(remaining.length, 3, 'an unavailable source hides only its dependent study');
    }
  }
});
test('incomplete catalogues do not expose studies that cannot load', () => {
  assert.deepEqual(compositeStudies([]), []);
  assert.deepEqual(compositeStudies(assets.map(a => ({ ...a, entry: null }))), []);
});
