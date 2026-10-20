import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('documented workshop choices match the shipped quality controls', () => {
  const html = readFileSync(new URL('../model-library/index.html', import.meta.url), 'utf8');
  for (const [id, label] of [['samples', 'Sample target'], ['bounces', 'Light bounces']]) {
    const select = html.match(new RegExp(`<select id="${id}"[^>]*>(.*?)</select>`))[1];
    const choices = [...select.matchAll(/<option[^>]*>(\d+)<\/option>/g)].map(match => match[1]);
    const row = readme.split('\n').find(line => line.startsWith(`| ${label} |`));
    assert.ok(row, `Missing ${label} reference`);
    assert.equal(row.split('|')[2].trim(), choices.join(', '));
  }
});

test('documented npm commands exist in the package', () => {
  const { scripts } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const commands = [...readme.matchAll(/npm run ([a-z:-]+)/g)];
  assert.ok(commands.length > 0);
  for (const [, command] of commands) assert.ok(scripts[command], `Unknown npm script: ${command}`);
});

test('the documented acquisition helper uses public exports', async () => {
  const api = await import('@plasius/gpu-demo-viewer/model-library/acquire');
  const example = readme.match(/```js\n([\s\S]*?)\n```/)[1];
  const bindings = example.match(/import \{([^}]+)\}/)[1].split(',').map(name => name.trim());
  for (const binding of bindings) assert.equal(typeof api[binding], 'function');
});
