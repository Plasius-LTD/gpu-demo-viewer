# Relic collection and tool-chest studies

Tracked work: site Story #2316 and viewer Task #80.

Extend the local model workshop with two arrangements of qualified originals
from the 61-model catalogue. Reuse `gpu-shared` 1.2.0 `createSceneInspection`
and renderer 0.2.54; ADR 0006 continues to apply. No new renderer, material
substitution, asset acquisition or architecture boundary is required.

The relic collection brings Gothic Statue, Marble Bust, Chess Set, Kite Shield
and Antique Estoc into shared light to compare stone, carved detail and metal.
The tool-chest arrangement brings Metal Tool Chest, Hand Plane, Vintage Hand
Drill, Rusted Spade and Rusted Can together to compare painted metal, rust,
wood and small contact shadows. Chosen dimensions and placement are illustrative,
not surveyed physical dimensions. Both arrangements use the shared neutral floor.

Feature site#1170 and Epic site#2271 govern this work. Inherit the remotely
controlled `gpu-demo.scene-fidelity.enabled` flag and existing localhost-only
review override. No public-site navigation is introduced by these local studies.
Rollback is selection of an individual model, disabling the existing review
entry, or reverting this viewer release; source originals remain available.

Before implementation, test both exact source sets, complete integrity manifests,
source attribution, safe incomplete-catalogue exclusion, and continued existing
scene selection. Keep shared six-source, geometry and texture budgets unchanged.
Exercise the existing shared camera, sampling, denoising, cancellation and cleanup
through the viewer tests and real WebGPU review. Require fixed64, camera reset
and refinement, denoising off/on, native UHD1, and a 320px reflow check. Record
failures honestly; completed UHD1 is not optical or real-time qualification.

Update consumer README and Unreleased changelog, maintain >=80% coverage and
changed-source LCOV, and pass tests, types/lint, build, package and audit checks.
Publish only through main `cd.yml` with the production environment after CI.
Verify the exact npm artifact before closing tracked work. The separate site
61-model deployment and original-model holds remain tracked independently.

## Registry-based review, 21 October 2026

Both arrangements rendered with released shared 1.2.0 and renderer 0.2.54,
without source overrides. The relic collection has 140,669 triangles, 44 mesh
primitives and eight source materials; the tool scene has 44,876 triangles,
16 primitives and five materials. Both totals include the shared ground.

Both completed fixed64 at 800 × 282, keyboard camera movement followed by
refinement, denoising off/on and native 3840 × 2160 at one sample. Both returned
to balanced resolution. At a 320px viewport each completed fixed64 at 800 × 601,
with all five originals visible and no horizontal document overflow, including
expanded source credits. The viewport was reset afterwards. Mouse orbit and
keyboard Home were also checked on the relic arrangement.

One DOM keyboard action immediately after viewport restoration exceeded the
automation input deadline; the page remained responsive, native Home input
restarted sampling and refinement completed. Quality changes still rebuild the
scene for several seconds. No renderer console warnings/errors were recorded.
These are functional static-scene checks, not reference optical fidelity,
animation playback, physical-touch or screen-reader-speech qualification.

All 59 viewer tests pass; line coverage and changed `scenes.js` coverage are
100%. Types/lint, build, package validation and the full dependency audit pass.
