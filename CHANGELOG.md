# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to SemVer.

## [Unreleased]

- **Fixed**
  - Added `index.js` compatibility entry shims for the root viewer and the
    showcase so stale cached entry URLs do not 404 when the runtime loads from
    `main.js`.
  - Prefilled the root viewer with a working showcase target so the initial
    `Open showcase` action works before client-side hydration completes.
  - Clamped showcase telemetry queue depths so the embedded preview no longer
    throws on arrival when stress or spray counts spike.

### Added

- Shared 3D harbor showcase with GLTF ships and physics metadata for cross-package validation.
- Experimental wavefront path-tracing technique demo with deterministic capture
  settings, emissive/skybox termination, reflection, refraction, fluid surface
  interaction, smooth normals, dark no-light paths, a denoise post-pass toggle,
  and queue-depth telemetry.
- Ambient residual handling for shallow no-light and max-depth wavefront paths
  so the demo approximates unresolved high-order indirect bounces without
  replacing active-ray emissive or environment hits.
- WebGPU compute-backed wavefront inspection mode with 360p, 720p, and 1080p
  presets, GPU primary-ray dispatch, compacted continuation queues, fixed tile
  bounce dispatch, and renderer-owned stats.
- Added tiled GPU ray queues and a 4K UHD preset so ray queue memory scales by
  tile size instead of full output resolution.
- Browser manifest coverage tests and a GLTF asset contract test.
- Added a physics focus mode for the shared showcase and promoted
  `gpu-physics` to a browser-backed 3D demo entry.
- Added baseline governance and validation scripts for repo standardization:
  `NFR.md`, `docs/adrs`, `npm run build`, and `npm run typecheck`.

### Changed

- Refreshed the viewer's shared GPU package baselines onto the latest stable
  published `@plasius/gpu-*` releases.
- The viewer now classifies the cloth, fluid, lighting, performance, and debug demos as browser-based 3D visual examples.
- Strengthened the shared showcase lighting and shadow model so the harbor demos
  present a more ray-traced near-field look.
- The viewer now consumes the shared harbor runtime from `@plasius/gpu-shared`
  instead of owning that source directly.
- The showcase browser entry now imports `@plasius/gpu-shared` through an
  import map instead of coupling directly to a deep `node_modules/.../dist`
  path.
