# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to SemVer.

## [Unreleased]

- **Added**
  - (placeholder)

- **Changed**
  - Updated runtime GPU dependencies to `@plasius/gpu-shared` `^1.0.2` and
    `@plasius/gpu-renderer` `^0.2.23`.
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.2] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.1] - 2026-06-22

- **Fixed**
  - Added `index.js` compatibility entry shims for the root viewer and the
    showcase so stale cached entry URLs do not 404 when the runtime loads from
    `main.js`.
  - Prefilled the root viewer with a working showcase target so the initial
    `Open showcase` action works before client-side hydration completes.
  - Clamped showcase telemetry queue depths so the embedded preview no longer
    throws on arrival when stress or spray counts spike.
  - Guarded wavefront renderer setup and initial probe rendering against stale
    async settings changes so older GPU work cannot replace the current renderer,
    update overlays, or restart the loop.

### Added

- Shared 3D harbor showcase with GLTF ships and physics metadata for cross-package validation.
- Experimental wavefront path-tracing technique demo using the renderer WebGPU
  mesh BVH path with 540p, 720p, and 1080p presets, model-only skybox/environment
  termination, reflection, refraction, smooth normals, a denoise post-pass toggle,
  and queue-depth telemetry.
- Live wavefront assessment controls with pause/resume, render-once, a 4K
  target preset, FPS/rays-per-second telemetry, and a 100% stacked frame timing
  chart for dispatch, GPU wait, probe/readback, overlay, and frame pacing.
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
- Replaced the old CPU/static wavefront tracer with a renderer-owned mesh BVH
  WebGPU mount so customer-visible wavefront output no longer uses analytic
  scene objects.
- The wavefront demo now exposes samples-per-pixel controls, defaults its
  540p/720p/1080p presets to 8 spp, and reports screen pixels separately from
  primary ray samples.
- The wavefront demo now updates renderer camera uniforms every RAF frame so
  the mesh BVH view has visible realtime motion instead of repeating one static
  path-traced frame.
- The wavefront performance panel now treats GPU completion as a sampled sync
  metric instead of hard-blocking every frame, reducing viewer-side queue
  serialization while still showing where occasional GPU waits land.
- The wavefront demo now submits only benchmark model meshes with ungated
  skybox/environment lighting, removing the previous synthetic floor, wall,
  emissive-panel, and fluid-surface blockers from the validation scene.
- The viewer now classifies the cloth, fluid, lighting, performance, and debug demos as browser-based 3D visual examples.
- Strengthened the shared showcase lighting and shadow model so the harbor demos
  present a more ray-traced near-field look.
- The viewer now consumes the shared harbor runtime from `@plasius/gpu-shared`
  instead of owning that source directly.
- The showcase browser entry now imports `@plasius/gpu-shared` through an
  import map instead of coupling directly to a deep `node_modules/.../dist`
  path.
- The viewer package now has public npm metadata, package payload validation,
  and a GitHub Actions CD workflow so it follows the same release posture as
  the other public `@plasius/*` package repositories.


[0.1.1]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.1.1
[0.1.2]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.1.2
