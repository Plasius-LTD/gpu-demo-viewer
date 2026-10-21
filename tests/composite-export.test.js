import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compositeStudyDefinitions } from '@plasius/gpu-demo-viewer/model-library/studies';
import { compositeStudies } from '../model-library/scenes.js';

const { assets } = JSON.parse(await readFile(new URL('../model-library/catalogue.json', import.meta.url)));
test('public definitions preserve all four qualified workshop placements', () => {
  const definitions = compositeStudyDefinitions();
  assert.deepEqual(definitions.map(d => d.key), ['study-furnished-interior','study-workshop','study-relic-collection','study-tool-chest']);
  assert.deepEqual(definitions.map(d => d.placements.length), [4,5,5,5]);
  const studies = compositeStudies(assets);
  for (const definition of definitions) {
    const study = studies.find(s => s.key === definition.key);
    assert.deepEqual(definition.placements, study.models.map(m => [m.asset.key,m.anchor,m.size,m.yaw]));
  }
});
test('editing a returned definition cannot mutate another caller or the workshop', () => {
  const original = compositeStudyDefinitions();
  const changed = compositeStudyDefinitions();
  changed[0].name = 'changed';
  changed[0].placements[0][1][0] = 999;
  changed[0].placements.push(['unknown',[0,0,0],1,0]);
  changed.pop();
  assert.deepEqual(compositeStudyDefinitions(), original);
  assert.equal(compositeStudies(assets).length, 4);
});
test('the typed data-only subpath and declarations ship in the supported package contract', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  assert.ok(pkg.files.includes('model-library/'));
  assert.deepEqual(pkg.exports['./model-library/studies'], {types:'./model-library/studies.d.ts',default:'./model-library/studies.js'});
  const source = await readFile(new URL('../model-library/studies.js', import.meta.url),'utf8');
  assert.doesNotMatch(source,/\b(?:import|fetch|document|window)\b/);
  const types = await readFile(new URL('../model-library/studies.d.ts', import.meta.url),'utf8');
  assert.match(types,/export function compositeStudyDefinitions\(\): CompositeStudyDefinition\[\]/);
});
