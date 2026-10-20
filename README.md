# @plasius/gpu-demo-viewer

[![npm version](https://img.shields.io/npm/v/@plasius/gpu-demo-viewer.svg)](https://www.npmjs.com/package/@plasius/gpu-demo-viewer)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/gpu-demo-viewer/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/gpu-demo-viewer/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/Plasius-LTD/gpu-demo-viewer)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

A browser workshop for inspecting source models with the Plasius GPU renderer,
plus a workspace launcher for the `gpu-*` package demos. The workshop provides
camera gestures, progressive rendering, quality controls and model credits.

The npm package includes the viewer source, manifest and build-time acquisition
helper. Model binaries are downloaded separately; they are not bundled in npm.

## Run the model workshop

Use Node.js 24 or later, npm, and a WebGPU-capable browser on localhost or HTTPS.
Clone the repository to run its Vite development server:

```sh
git clone https://github.com/Plasius-LTD/gpu-demo-viewer.git
cd gpu-demo-viewer
npm ci
npm run models:download
npm run models:dev
```

Open [the local workshop](http://127.0.0.1:5291/?review=first-twelve).
The default download command selects the original review batch. It verifies the
exact size and SHA-256 of each model and its buffer/image dependencies, preserving
source files and credits. Downloaded binaries live in `model-library/assets/`
and are ignored by Git and npm. The workshop uses the published shared inspection
and renderer dependencies from the lockfile; sibling source overrides are optional.

The original batch includes a **manual Medieval house download**. Obtain the
original GLB from the model's credited Sketchfab source and place it at
`model-library/assets/sf-house/medieval_house.glb`, then rerun the download command.
A missing manual file produces a placement message; this command does not download
it for you. Only the pinned original file passes verification. Gem is excluded
from the rollout and is not substituted.

To acquire another reviewed batch or choose a different local port:

```sh
npm run models:download -- 1
npm run models:dev -- --port 5292
```

Select one batch at a time. A catalogue record can still be held for acquisition,
licensing or visual review; it is not a claim that the model is available locally
or enabled on the production site. The download helper admits only configured
resources and keeps two workers, a 100 MiB per-file limit and a 200 MiB batch limit.
Source, creator, licence and review notes appear beside each model.

## Camera and render quality

Drag or use one finger to orbit; Shift/right-drag trucks, Alt-drag pans, and the
wheel or pinch moves closer/farther. Two-finger movement trucks. Focus the canvas
to use arrows, Shift-arrows, +/− and keyboard modes 1–5. `Home` restores framing;
`?` replays a brief gesture reminder. Persistent instructions remain in Camera help.

| Control | Choices | Default |
| --- | --- | --- |
| Sample target | 1, 8, 16, 32, 64, 128, 256 | 64 |
| Light bounces | 2, 4, 6, 8, 10, 12 | 6 |
| Render size | 480, 800, 1280 px width; 1920×1080, 2560×1440, 3840×2160 | 800 px width |
| Denoising | On or off | On |

The first pass uses one sample. Once the camera is still, batches of up to four
refine toward the target. Camera and quality changes restart history. Hidden tabs
pause further work; progress reports GPU-completed samples and actual dimensions.
Settings do not reload the source model. Resizing preserves the camera.

HD, QHD and 4K presets trace the exact selected dimensions independently of the
window size; the canvas contains the image without stretching. Use one sample for
a quick full-resolution check. GPU memory and rendering time depend on the model,
resolution and device. Current released sampling is fixed progressive sampling;
per-pixel adaptive controls remain separate qualification work.

This workshop displays static geometry. Source animation clips remain in the
original assets, but are not played here. Material variants are not selectable;
for example, the sheen chair uses its default material. Completion of a render
does not resolve the visual findings recorded in its review notes.

## Embed the rendering runtime

For an application view, use
[`@plasius/gpu-shared/model-inspection`](https://github.com/Plasius-LTD/gpu-shared#inspect-a-model).
It owns model loading, integrity verification, camera handling and refinement.
This viewer supplies the surrounding catalogue, controls and review workflow.

Node build tools can use the published acquisition helper:

```sh
npm install @plasius/gpu-demo-viewer
```

```js
import { acquisitionPlan, acquireFixtures } from "@plasius/gpu-demo-viewer/model-library/acquire";

// Pass one reviewed batch of catalogue asset records and an absolute destination.
export async function downloadReviewedBatch(assets, root) {
  const plan = acquisitionPlan(assets, root); // Validates paths, sources and budgets.
  console.log(`Verified download plan: ${plan.length} resources`);
  return acquireFixtures({ assets, root });
}
```

The input shape follows
[model-library/catalogue.json](https://github.com/Plasius-LTD/gpu-demo-viewer/blob/main/model-library/catalogue.json).
Only approved HTTPS providers are accepted; redirects fail. Existing files must
match their pinned hashes and sizes; missing manual sources fail with a placement
message. Keep this Node helper out of browser bundles. Site builds may enforce
stricter limits and must verify the complete dependency closure.

## Workspace demo launcher

The static root launcher expects sibling `gpu-*` package checkouts and their
required builds. It is useful when developing the package family together.
From a checkout named `gpu-demo-viewer`, with Python 3 installed:

```sh
npm run demo
```

Visit [the workspace launcher](http://localhost:8000/gpu-demo-viewer/).
The server serves the parent directory so sibling demo URLs remain reachable.
Browser-backed demos can be launched or embedded; code-example packages show
their command and entry file. `gpu-world-generator` uses its built `demo/dist/`.
The manifest is tested so sibling demo folders are not missed.

See [the experimental wavefront viewer](https://github.com/Plasius-LTD/gpu-demo-viewer/blob/main/docs/wavefront-viewer.md)
for its separate capture mode, benchmark controls and timing interpretation.

## Development and review records

```sh
npm run build
npm run typecheck
npm run lint
npm run test:coverage
npm run pack:check
```

`build` verifies the static viewer contract; `typecheck` checks shipped JavaScript
syntax. Neither command performs browser GPU qualification.

For deliberate local development against an unreleased package, the model Vite
config accepts `PLASIUS_SHARED_INSPECTION_SOURCE` (absolute `src/model-inspection.js`)
and `PLASIUS_RENDERER_SOURCE` (absolute `src/index.js` or built `dist/index.js`).
These overrides are local development tools. Production consumes published,
qualified package versions and approved source assets.

- [Initial model findings](https://github.com/Plasius-LTD/gpu-demo-viewer/blob/main/docs/model-library-review.md).
- [UHD inspection contract](https://github.com/Plasius-LTD/gpu-demo-viewer/blob/main/docs/model-inspection-uhd.md).
- [Catalogue rollout requirements](https://github.com/Plasius-LTD/gpu-demo-viewer/blob/main/docs/catalogue-production-rollout.md) and [live delivery tracking](https://github.com/Plasius-LTD/plasius-ltd-site/issues/2308).
- [Non-functional requirements](https://github.com/Plasius-LTD/gpu-demo-viewer/blob/main/NFR.md), [workflow](https://github.com/Plasius-LTD/gpu-demo-viewer/blob/main/WORKFLOW.md), [flags and capabilities](https://github.com/Plasius-LTD/gpu-demo-viewer/blob/main/FLAGS_AND_CAPABILITIES.md), and [architecture decisions](https://github.com/Plasius-LTD/gpu-demo-viewer/blob/main/docs/adrs/index.md).

The research manifest retains source identities and credits separately from
acquisition state. Production entitlement and visual qualification are distinct
from downloading a model. GitHub Project tracking owns current delivery status;
voxel conversion follows qualification of the original-model catalogue.

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
