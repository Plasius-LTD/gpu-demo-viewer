# @plasius/gpu-demo-viewer

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

This repository is intentionally a static validation surface rather than a
bundled application package.

- `npm run demo` serves the workspace root so sibling `gpu-*` demos are
  reachable from one URL.
- `npm run typecheck` syntax-checks the shipped browser entrypoints and
  manifest modules.
- `npm run build` verifies the static contract documented in
  `docs/adrs/adr-0001-gpu-demo-viewer-governance-baseline.md`.

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
npm test
```

## Governance

- Non-functional requirements: [`NFR.md`](./NFR.md)
- Delivery workflow: [`WORKFLOW.md`](./WORKFLOW.md)
- Feature flags and capabilities: [`FLAGS_AND_CAPABILITIES.md`](./FLAGS_AND_CAPABILITIES.md)
- Architectural decision log: [`docs/adrs/index.md`](./docs/adrs/index.md)
