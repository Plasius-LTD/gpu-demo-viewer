# @plasius/gpu-demo-viewer

Static root-level launcher for validating the `gpu-*` package demos from one place.

## Purpose

This viewer exists to accelerate manual validation across the GPU package surface:

- browser-backed demos can be launched or embedded from one URL
- the integrated showcase consumes the shared 3D harbor runtime from `@plasius/gpu-shared`
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

## Validation Notes

- Browser-backed WebGPU demos still require `localhost` or `HTTPS`.
- The shared integration showcase is 3D but does not require WebGPU initialization just to render the validation scene.
- The showcase now resolves `@plasius/gpu-shared` through an import map so the browser entry uses the package public surface instead of a deep internal file path.
- `gpu-world-generator` is launched from its built `demo/dist/` bundle in the viewer because its source demo uses a Vite workflow.
- Code-example packages are listed for discovery but are not embedded in an iframe.

## Local Checks

```bash
npm run lint
npm test
```
