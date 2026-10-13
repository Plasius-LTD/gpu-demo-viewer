# First model review — 13 October 2026

Ten original assets are installed with 55 verified files (47,523,261 bytes, about 45.3 MiB). The first-twelve shortlist remains intact; the user deferred the two Sketchfab downloads. Files and credits remain in `model-library/assets/`; `catalogue.json` records their original URLs, exact sizes and SHA-256 checksums. Source files have not been altered.

The preview uses the Plasius wavefront renderer at eight samples per pixel and six bounces, with shared glTF import and camera gestures. Geometry is uniformly normalized to the inspection frame. It has no model-specific ageing or environment staging. “Rendered” is not a visual-fidelity approval.

| Model | Rendered triangles | Result / next improvement |
|---|---:|---|
| Large Castle Door | 12,640 | Geometry and weathered textures render. Improve separation of iron and wood under varied lighting. |
| Fern 02 | 6,232 | Four clumps render. Source materials are opaque; this fixture alone does not prove alpha-mask support. Inspect backlighting and small-leaf shading. |
| Quiver Tree 01 | 150,124 | Trunk and foliage render; the heaviest geometry in this pass. Review LOD selection, fine-leaf shading and responsiveness. |
| Rock Moss Set 01 | 63,127 | Six rock primitives render. Need per-rock framing and ground-contact lighting for presentation. |
| Garden Gloves 01 | 6,822 | Fabric/rubber colour and detail render. No fibre groom is authored; region masks and cloth shading need a later pass. |
| Wooden Crate 02 | 5,176 | Wood and rope detail render. The original chest’s wear/fray masks are deliberately not applied to a different mesh. |
| Bronze Whale Statue | 3,816 | Geometry and patina render, but metal reads too flat under this lighting. Needs reference comparisons and better reflected surroundings. |
| Antique Ceramic Vase 01 | 9,408 | Pattern and silhouette render; glaze appearance and visible sampling noise need improvement. |
| Mosquito In Amber | 14,349 | **Visual defect:** almost-black surface and horizontal bands. Investigate transmission, volume scaling and the renderer path before public use. |
| Fox | 576 | Static textured mesh renders. Survey, Walk and Run clips are retained but not played by this importer. |

## Priorities exposed

1. Amber transmission/volume correctness and banding. Use this unchanged fixture as a regression case; do not replace its material to hide the defect.
2. Cleaner sampling and controlled environment/reflection lighting. Noise and low material contrast are visible across several models.
3. Skinning and source-animation playback for Fox; bone transforms must be verified before motion can be claimed.
4. Per-object framing for sets, grounded presentation and model-specific ageing/fibre masks.

## Validation and limits

All ten were selected and visually inspected in the local browser. Desktop, 320px reflow, visible load/deferred states and keyboard inspection are checked. Shared camera unit coverage exercises mouse and multitouch handling; physical touchscreen hardware and screen-reader speech were not tested. This is not a WCAG or visual-quality certification. Browser captures are retained with the local review output.

Local validation passed: 32 viewer tests, 100% changed-source line coverage (97.61% overall measured branches), lint/type checks, build, package checks and a dependency audit with zero reported vulnerabilities. The shared runtime passed 177 tests; its two added source modules have 100% line coverage. The package dry run excludes downloaded asset binaries. Keyboard orbit, approach and Home reset were visually checked; the final browser error log was empty.

No production route or entitlement was changed. The shared-package release and consumer final dependency pin remain blocked while the organisational runners are offline. The consumer PR must stay draft until the upstream package is published, its dependency is updated and the published runtime is revalidated. See ADR 0003 for the local-only rollout and rollback controls.
