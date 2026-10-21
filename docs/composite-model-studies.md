# Furnished interior and workshop studies

Feature: site#1170; Story site#2313; viewer Task #73; shared Task #161.
Inherited remote rollout: `gpu-demo.scene-fidelity.enabled`.

After qualifying and releasing the forty-model batch, add two local workshop
studies using the shared `createSceneInspection` API. The furnished interior
compares the sofa, silk pouf, cabinet and basket. The workshop compares the
spinning wheel, barrel, crate, vice and blowtorch. All are existing credited,
integrity-checked originals. Scale and placement are authored review choices.

Keep individual models available and clearly distinguish composite studies from
the model count. Show every source/author/licence and chosen dimension. Reuse the
existing quality controls, camera help, progressive status, cancellation and
visibility lifecycle. Load only the selected model or study. Public-site scene
navigation is separate qualified consumer work.

Before implementation, test scene selection, complete source requests, missing
source rejection, credits, shared quality/lifecycle controls and cancellation.
Review both arrangements in actual WebGPU with >=3 sources together, camera
movement and native UHD. Release the shared package first, then consume that
registry version and repeat the review before viewer release. Keep source aliases
explicit and local to development. Record limits instead of claiming untested
animation, adaptive optical quality, physical touch or screen-reader speech.

## Initial browser review

The four-model interior (211,146 triangles including ground) and five-model
workshop (82,635 triangles) completed fixed 64 samples at 800 × 282 with
renderer 0.2.54 and a local source override for the new shared API. Both also
completed native 3840 × 2160 at one sample; camera changes and denoising-off
refinement completed again. The interior additionally passed mouse orbit and
a UHD-to-balanced round trip using native browser menus. All source credits
and licence links were inspected. At a 320-pixel viewport the interior completed
64 samples at 800 × 601, all four models remained in frame, and the page and
expanded credits had no horizontal overflow. The temporary viewport override was
reset. No renderer console warnings/errors appeared.

Preparing a heavy scene after quality changes takes several seconds. Direct DOM
automation hit its three-second input deadline and left two transitions incomplete;
a clean page with native menu input completed the same transition. This does
not establish real-time responsiveness. The retained evidence records this
limitation alongside the completed frames. Physical touch, screen-reader speech
and reference optical fidelity remain untested. The original versus voxel
distinction is unchanged.

## Registry-consumer qualification

Both studies were reviewed again with the published `gpu-shared` 1.2.0 and
`gpu-renderer` 0.2.54 packages, with no source aliases. Both completed 64 samples
at 800 × 282, refined after keyboard camera movement and denoising changes, and
completed native 3840 × 2160 at one sample. The interior also completed the return
to balanced resolution. No renderer console warnings/errors appeared. A native
checkbox action exceeded the automation input deadline but the requested quality
change and subsequent 64-sample refinement completed.

The repeat mobile check could not be completed: the high-level viewport override
did not affect the review tab, and browser approval rejected tab-scoped emulation.
No workaround was attempted. The earlier source-version 320-pixel evidence still
applies to the same layout; this is not a claim of a second mobile test.

The viewer suite passes all 56 tests with 100% line coverage, including all changed
JavaScript sources in LCOV. Syntax, build, package-content and full dependency
audit checks pass. These are functional render checks; one-sample UHD output is
not an optical-quality or performance qualification.
