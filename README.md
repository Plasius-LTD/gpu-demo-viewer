# @plasius/gpu-demo-viewer

Static root-level launcher for validating the `gpu-*` package demos from one place.

## Purpose

This viewer exists to accelerate manual validation across the GPU package surface:

- browser-backed demos can be launched or embedded from one URL
- the integrated showcase consumes the shared 3D harbor runtime from `@plasius/gpu-shared`
- the experimental wavefront path-tracing demo exposes active-ray bounce behavior from
  the published `@plasius/gpu-renderer` contract
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

Deterministic capture settings are available at:

```text
http://localhost:8000/gpu-demo-viewer/wavefront/?experimental=wavefront&capture=1
```

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
- The wavefront path-tracing demo is intentionally deterministic and runs as a
  static canvas reference surface. It uses the renderer wavefront plan contract,
  disables optional explicit light probes, and demonstrates that active paths
  terminate on emissive geometry, skybox/environment hits, no-light absorption,
  or maximum depth.
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
