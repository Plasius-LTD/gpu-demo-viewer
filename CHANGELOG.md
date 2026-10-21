# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to SemVer.

## [Unreleased]

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.2.2] - 2026-10-21

- **Added**
  - Twelve original sculpture, lighting, vessel and product studies with source integrity and registry-renderer review records; four optical/UHD failures remain held.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.2.1] - 2026-10-21

- **Added**
  - Nine original tool and material studies in acquisition batch five, with source hashes, licences and released-renderer qualification evidence.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.2.0] - 2026-10-21

- **Added**
  - Furnished-interior and workshop composite studies in the local model workshop, with shared inspection controls and individual source credits.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - Update the workshop's Vite development dependency to the patched 8.3.5 release.

## [0.1.11] - 2026-10-21

- Add the nine qualified furniture/workshop source models and their integrity inventories, using released shared1.1.12 and renderer0.2.54; reconcile the prior 31-model production records.

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.10] - 2026-10-20

- Restore workshop setup and current quality controls near the start of the README; separate workspace/maintainer guidance and replace stale release counts with authoritative tracking links.

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.9] - 2026-10-18

- Add nine original natural-object and textile models with fixed64/UHD inspection evidence, pinned Khronos resources and explicit default-material limits.

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.8] - 2026-10-18

- Consume released renderer 0.2.51 and shared 1.1.8 for responsive camera updates and material reuse on repeated modular-kit meshes.

- Export the existing bounded Node asset-acquisition helper for hash-pinned build-time consumers; record five further acquired foliage/terrain models and four LOD holds.

- Prepare six original Poly Haven models for the next review batch and bound acquisition to an explicitly selected batch.

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.7] - 2026-10-18

- Exclude Gem at user request and record the original Amber fixed-transport qualification; the production target is 74 models.

- Track all 75 model candidates, their first-twelve/seven-batch membership and explicit acquisition, held and production states before the later voxel pass.

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.6] - 2026-10-14

- Bind fixed progressive/UHD model review to published renderer and shared inspection APIs; retain experimental adaptive controls in their qualification branch.

- Add exact Full HD, QHD and 4K UHD model-review presets, one-sample inspection and aspect-preserving canvas presentation.

- Model-library sample target, bounce, resolution and denoising controls with progressive still-camera refinement and completed-sample progress.

- **Added**
  - Local model-library review with eleven acquired fixtures, including the manually supplied Medieval house GLB, source credits, integrity manifests, shared camera inspection and explicit visual-defect/deferred states.

- **Changed**
  - Refreshed compatible @plasius/* lockfile resolutions to the latest published releases.
 - Routed trusted validation through the organization-owned quarantined
    self-hosted runner group while continuing to reject fork pull-request code.
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.5] - 2026-08-31

- **Added**
  - (placeholder)

- **Changed**
  - Restored exact-main npm publication on a GitHub-hosted runner through
    short-lived OIDC, with an enforced Node/npm runtime and no long-lived
    write-token fallback.
  - Routed pull-request validation to isolated GitHub-hosted capacity while
    retaining exact-main push validation on fixed self-hosted Linux runners.
  - Refreshed GPU runtime dependencies to the currently published renderer,
    shared-contract, and XR package versions so clean release installs remain
    reproducible.
  - Made cross-repository manifest validation compare against a committed GPU
    demo target inventory in canonical checkouts, worktrees, and hosted CI.
  - (placeholder)

- **Fixed**
  - Peeled existing annotated release tags to their target commits before
    exact-main recovery comparisons.

- **Security**
  - (placeholder)

## [0.1.4] - 2026-08-30

- **Added**
  - (placeholder)

- **Changed**
  - Refreshed the browser demo runtime dependencies and package lockfile.
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.3] - 2026-07-01

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
[0.1.3]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.1.3
[0.1.4]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.1.4
[0.1.5]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.1.5
[0.1.6]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.1.6
[0.1.7]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.1.7
[0.1.8]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.1.8
[0.1.9]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.1.9
[0.1.10]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.1.10
[0.1.11]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.1.11
[0.2.0]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.2.0
[0.2.1]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.2.1
[0.2.2]: https://github.com/Plasius-LTD/gpu-demo-viewer/releases/tag/v0.2.2
