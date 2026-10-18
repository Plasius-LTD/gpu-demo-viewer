/** Delivery metadata only: this does not grant runtime access or mark a render qualified. */
const statuses = new Set(['researched', 'awaiting-source', 'acquired', 'imported', 'held', 'qualified', 'production', 'excluded']);

export function selectBatch(entries, batch) {
  if (!Number.isInteger(batch) || batch < 0 || batch > 7) throw new Error('Invalid catalogue batch.');
  return entries.filter(entry => entry.batch === batch);
}

export function validateRollout(assets, entries) {
  const identities = new Set(assets.map(asset => asset.key));
  if (identities.size !== assets.length || entries.length !== assets.length
      || new Set(entries.map(entry => entry.key)).size !== identities.size
      || entries.some(entry => !identities.has(entry.key))) {
    throw new Error('Catalogue identity mismatch.');
  }
  const first = assets.filter(asset => asset.priority === 'First 12');
  const remaining = assets.filter(asset => asset.priority !== 'First 12');
  const expected = new Map([
    ...first.map(asset => [asset.key, 0]),
    ...remaining.map((asset, index) => [asset.key, 1 + Math.floor(index / 9)]),
  ]);
  for (const entry of entries) {
    if (!statuses.has(entry.status)) throw new Error('Invalid catalogue status.');
    if (entry.batch !== expected.get(entry.key)) throw new Error('Catalogue batch mismatch.');
  }
  return {total: assets.length, first: first.length, remaining: remaining.length,
    batches: Math.ceil(remaining.length / 9)};
}
