# @plasius/gpu-demo-viewer

[![npm version](https://img.shields.io/npm/v/@plasius/gpu-demo-viewer.svg)](https://www.npmjs.com/package/@plasius/gpu-demo-viewer)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/gpu-demo-viewer/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/gpu-demo-viewer/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/Plasius-LTD/gpu-demo-viewer)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

Static root-level launcher for validating the `gpu-*` package demos from one place.

## Purpose

This viewer exists to accelerate manual validation across the GPU package surface:

- browser-backed demos can be launched or embedded from one URL
- the integrated showcase consumes the shared 3D harbor runtime from `@plasius/gpu-shared`
- the experimental wavefront path-tracing demo mounts the
  `@plasius/gpu-renderer` WebGPU mesh BVH renderer
- remaining code-example demos still expose their recommended command and entry file
- the manifest is tested so new `gpu-*` demo folders do not get missed

## Run

From this package:

```bash
npm run demo
```

Then open:

```text
http://localhost:8000/gpu-demo-viewer/
```

The server points at the workspace root, so sibling package demos remain reachable from the viewer.

To open the experimental wavefront path-tracing technique demo directly:

```text
http://localhost:8000/gpu-demo-viewer/wavefront/?experimental=wavefront
```

Deterministic 540p capture settings are available at:

```text
http://localhost:8000/gpu-demo-viewer/wavefront/?experimental=wavefront&capture=1
```

The displayed primary-ray count is calculated as:

```text
render width x render height x samples per pixel
```

The debug panel also reports the separate screen-pixel count so render
resolution and stochastic sampling cost remain visible independently.
Continuation rays are then spawned from the active queue by bounce depth inside
the renderer. The active demo presets are 960x540 capture, 1280x720 balanced,
1920x1080 detail, and a 3840x2160 4K target. The 540p/720p/1080p presets
default to 8 samples per pixel, while 4K defaults to 4 samples per pixel; the
renderer keeps queue buffers tile-bounded so these targets do not require
full-frame ray queues.

The wavefront page runs a live render loop by default. The performance panel
shows FPS, frame timing, primary rays per second, and a 100% stacked timing bar
for the viewer-observed frame budget: WebGPU command dispatch, GPU completion
wait, optional probe/readback, overlay update, and requestAnimationFrame pacing.
These timings are browser-side measurements; they identify where the viewer is
blocked each frame but do not yet replace future GPU timestamp-query profiling
inside individual compute passes.

## Static Validation Contract

This repository is a public npm package that ships the static validation
surface for the `gpu-*` family.

- `npm run demo` serves the workspace root so sibling `gpu-*` demos are
  reachable from one URL.
- `npm run typecheck` syntax-checks the shipped browser entrypoints and
  manifest modules.
- `npm run build` verifies the static contract documented in
  `docs/adrs/adr-0001-gpu-demo-viewer-governance-baseline.md`.
- `npm run pack:check` verifies the public npm package payload before GitHub
  Actions publishes it.
- Releases are published only through `.github/workflows/cd.yml` with npm
  provenance and the GitHub `production` environment.

## Validation Notes

- Browser-backed WebGPU demos still require `localhost` or `HTTPS`.
- The wavefront path-tracing demo is a WebGPU renderer mount, not a CPU/static
  canvas tracer. It submits only the benchmark model mesh set with
  `displayQuality: true`, builds the renderer mesh BVH on the GPU, disables
  environment portals, and leaves skybox/environment lighting as the only
  scene lighting source. The demo intentionally excludes the previous synthetic
  room, floor, wall, emissive-panel, and fluid-surface geometry so most escaped
  paths should terminate against the skybox rather than unlit scene blockers.
  Shallow no-light/max-depth paths return the renderer ambient residual to
  approximate unresolved high-order indirect bounces. The demo exposes 1, 4, 8,
  and 16 samples-per-pixel settings and defaults to 8 spp for the 540p, 720p,
  and 1080p presets. The denoise toggle runs the renderer post pass; denoise
  smooths neighboring pixels but does not replace active-ray skybox/environment
  hits as the primary lighting source. The loop updates camera uniforms every
  animation frame through `@plasius/gpu-renderer` so the FPS counter represents
  a moving realtime render rather than repeated presentation of one static
  frame.
- The wavefront performance chart is intended for local tuning: compare
  resolution, depth, samples-per-pixel, and denoise settings while watching
  whether time is dominated by command dispatch, sampled GPU completion sync,
  readback, overlay work, or frame pacing. The demo does not hard-sync every
  frame; completion sync is sampled periodically to avoid making the viewer
  itself serialize the GPU queue.
- The shared integration showcase is 3D but does not require WebGPU initialization just to render the validation scene.
- The showcase now resolves `@plasius/gpu-shared` through an import map so the browser entry uses the package public surface instead of a deep internal file path.
- `gpu-world-generator` is launched from its built `demo/dist/` bundle in the viewer because its source demo uses a Vite workflow.
- Code-example packages are listed for discovery but are not embedded in an iframe.

## Local Checks

```bash
npm run build
npm run typecheck
npm run lint
npm run pack:check
npm test
```

## Governance

- Non-functional requirements: [`NFR.md`](./NFR.md)
- Delivery workflow: [`WORKFLOW.md`](./WORKFLOW.md)
- Feature flags and capabilities: [`FLAGS_AND_CAPABILITIES.md`](./FLAGS_AND_CAPABILITIES.md)
- Architectural decision log: [`docs/adrs/index.md`](./docs/adrs/index.md)
<!-- BEGIN PLASIUS RELEASE INTEGRITY -->
## Release integrity

Production package publication runs only from `.github/workflows/cd.yml` on
protected `main`. The job verifies that the prepared commit is still the
current main commit and has an exact successful `ci.yml` push result before it
mutates release state. Same-repository pull requests and exact-main pushes use
the organization-owned `Public CI - Quarantined` runner group with fixed
self-hosted Linux labels; fork code is not admitted to that trusted runner
boundary. npm publication runs on
GitHub-hosted Node.js 24 with
npm 11.5.1 or newer, uses the protected `production` environment and
short-lived npm OIDC with provenance, and has no long-lived npm write-token
fallback. Rollback disables CD; it never rewrites published package history.
<!-- END PLASIUS RELEASE INTEGRITY -->

## Model library review

`npm run models:download` installs the ten reviewed, freely licensed Poly Haven and Khronos fixtures from `model-library/catalogue.json`, including all buffer/image dependencies. Downloads are bounded and SHA-256 checked; binaries are ignored by Git and npm. `npm run models:dev` opens the localhost server on port 5291. Visit `http://127.0.0.1:5291/?review=first-twelve`. The Medieval house is a manually supplied eleventh asset; Gem is excluded from the rollout by request. Source links, creators and licences are available beside each model.

For Medieval house, obtain the original GLB from its credited Sketchfab source and place it at `model-library/assets/sf-house/medieval_house.glb`, then run `npm run models:download` to verify its pinned size and SHA-256 and write its credits. This command never downloads manual assets; a missing file produces an explicit placement message. The catalogue stores no private local paths.

This page consumes the shared model-inspection package entrypoint. While its upstream release is pending, development testing can set `PLASIUS_SHARED_INSPECTION_SOURCE` to an absolute path to the reviewed sibling `src/model-inspection.js`; this explicit source override is for localhost development only, not a released dependency or production deployment.

Mouse/touch/keyboard inspection reuses the material-study camera. The view progressively refines while the camera is still, stopping at the selected sample target. `Home` restores framing and `?` displays a brief gesture reminder. Resizing updates resolution while preserving the camera. Fox is static here; its Survey, Walk and Run clips remain in the original download. Amber uses the fixed-continuation correction in renderer 0.2.50; its original materials are unchanged. See `docs/model-library-review.md` for the initial findings; none of these fixtures is implicitly approved for the production showcase.

Render-quality controls select 8–256 total samples, 2–12 light bounces, 480/800/1280px render width and denoising. Defaults are 64/6/800/on. The first pass is one sample; idle refinement adds up to four samples per batch. Camera and quality changes restart history. Hidden tabs pause further work; the progress bar reports completed samples and actual dimensions. Settings do not reload the source model.

During upstream progressive-renderer development, also set `PLASIUS_RENDERER_SOURCE` to an absolute reviewed `src/index.js` or built `dist/index.js`. Both source overrides are development-only; PRs remain dependency-blocked until approved package CD and final released-version validation. To use another local port: `npm run models:dev -- --port 5292`.

The model review includes native 1920 × 1080, 2560 × 1440 and 3840 × 2160 quality presets. These trace the exact selected pixel dimensions independently of viewport size; the canvas contains the image without stretching. A one-sample target supports quick full-resolution checks. See [UHD inspection design](docs/model-inspection-uhd.md).

The released model review uses fixed progressive sampling with native UHD sizes and requires renderer 0.2.51/shared 1.1.8 or newer. Adaptive controls remain in a separate qualification branch. See [release scope](docs/model-review-release.md); the local inspection catalogue explicitly retains unresolved visual findings.

## Complete model catalogue rollout

The [74-model production rollout](docs/catalogue-production-rollout.md) tracks the
eleven retained originals and seven subsequent batches of nine. The research
manifest retains the excluded Gem identity, making 75 research records. `model-library/rollout.json`
records acquisition/qualification state separately from production entitlement;
`research-catalogue.json` preserves the original source identities and credits.
Ten models are currently production-verified. Amber is locally qualified with renderer 0.2.50 and awaits production verification; Gem is excluded by request. Research entries are not a claim of downloaded or working
models. Voxel conversion is the following pass after original-model production
qualification. GitHub Story [2308](https://github.com/Plasius-LTD/plasius-ltd-site/issues/2308)
owns delivery and acceptance.

### Review batch downloads

`npm run models:download -- 1` acquires only the six checked Poly Haven models
in the first follow-on batch. The default remains batch 0 (the original group).
Each batch retains the existing 200 MiB total and 100 MiB per-file download
limits, two workers and exact hashes. Downloaded models are candidates, not
production approvals. The local workshop includes acquired candidates with
their source credits; production remains a separately qualified catalogue.

### Build-time model acquisition

Node consumers may import `acquisitionPlan` and `acquireFixtures` from
`@plasius/gpu-demo-viewer/model-library/acquire`. Pass reviewed asset metadata
and a destination root; the helper verifies exact bytes and SHA-256, uses only
approved HTTPS providers without redirects, and bounds concurrency, time and
bytes. Select one explicit reviewed batch per call (200 MiB total / 100 MiB per
resource maximum). Existing files must match; missing manual sources fail closed.
This Node subpath is build tooling and must not enter browser bundles. Binary
assets are not included in the npm package. Site build-time use retains stricter
resource limits and verifies the complete source dependency closure.

The review now consumes published renderer 0.2.51 and shared 1.1.8: camera movement reuses unchanged scene geometry, and repeated source primitives share their authored materials during import.

Batch three adds nine locally inspected natural objects and textile studies,
including the original Khronos sheen chair and cloth. All 31 acquired models
retain their source hashes and credits. Local qualification does not mark the
new batch live; the sheen chair currently supports only its default material.
