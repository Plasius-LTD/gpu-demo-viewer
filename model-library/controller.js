export function reviewEnabled(href) {
  const url = new URL(href);
  return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    && url.searchParams.get('review') === 'first-twelve';
}
export function fixtureRequest(asset, base) {
  const safe = path => typeof path === 'string' && /^[\w./-]+$/u.test(path)
    && !path.startsWith('/') && !path.split('/').includes('..');
  if (!safe(asset.key) || asset.key.includes('/') || !safe(asset.entry)
      || !asset.files.every(file => safe(file.path))) throw new Error('Unsafe fixture path.');
  const root = new URL(`assets/${asset.key}/`, base);
  return { modelUrl: new URL(asset.entry, root).href,
    integrity: Object.fromEntries(asset.files.map(f => [new URL(f.path, root).href, f.integrity])) };
}
export function createReviewController({ load, onState }) {
  let abort, active, generation = 0, disposed = false;
  return {
    async select(asset) {
      if (disposed) return;
      const id = ++generation;
      abort?.abort(); active?.destroy(); active = undefined;
      abort = new AbortController();
      if (!asset.entry) { onState({kind:'missing', asset, message:'Download deferred. This model is not installed.'}); return; }
      onState({kind:'loading',asset});
      try {
        const runtime = await load(asset, abort.signal);
        if (disposed || id !== generation) { runtime.destroy(); return; }
        active = runtime; onState({kind:'ready',asset,runtime});
      } catch (error) {
        if (!disposed && id === generation) onState({kind:'error',asset,message:error.message});
      }
    },
    reset() { active?.reset(); },
    destroy() {
      if (disposed) return;
      disposed = true; generation++; abort?.abort(); active?.destroy(); active = undefined;
    },
  };
}
