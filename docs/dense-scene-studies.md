# Dense scene studies

The astronaut grove studies place 50 or 100 astronauts among six trees and twelve
shrub groups. Each group retains the complete seven-variant Searsia source. This
is a static instancing test: source meshes and acceleration structures are shared,
with distinct transforms per placement. Original geometry and textures are kept.

Acquire the three integrity-pinned sources with:

```sh
npm run models:download -- crowd
npm run models:dev
```

Open the local workshop with `?review=first-twelve&model=study-astronaut-grove-100`
and choose the requested sample count, bounces, image size and denoising. Pause
when hidden, move/reset the camera to invalidate history, and compare the 50- and
100-placement study. An allocation or GPU failure must remain visible; choose a
smaller quality target or retry explicitly rather than silently changing the scene.

The `model-library/studies` export provides `denseStudyDefinitions()` alongside
the original `compositeStudyDefinitions()`. Dense definitions carry `instancing`
and `camera` as well as placement data. Resolve each source through your reviewed
catalogue, pass those options to `createSceneInspection`, and display the returned
source/instance counts and allocation report. Repeated models need one source
attribution, with a placement count, rather than a hundred duplicate credits.

The 100-astronaut scene has 118 model placements, 365 mesh instances including its
ground, 25 unique mesh primitives and 528,922 unique triangles. The expanded
geometry equivalent is 5,587,450 triangles. More instances still require TLAS and
transform storage and add ray traversal/shading work. Requested GPU storage also
depends on image size and denoising. It excludes driver overhead, other tabs and
physical-memory residency; it is not a measure of available VRAM.

Astronaut is credited to Poly under CC-BY-2.0, from the pinned Google model-viewer
source and attribution record in `catalogue.json`. Quiver Tree and Searsia Lucida
retain their existing Poly Haven CC0 source records and authors. Benchmark assets
are additional fixtures, separate from the original 74-model production target.

Qualification requirements: deterministic counts and fresh layout data; complete
integrity manifests; visible attribution; unchanged original composites; allocation
and device-loss errors; source cleanup; keyboard/touch/mouse and mobile layout;
registry-based 50/100 GPU review; approved release and public verification. Local
source-injected results alone do not establish production readiness. Track evidence
under Task #90 and Story site#2336.

After a resource allocation or device failure, adjust the quality settings and
choose **Retry selected scene**. Changes while failed do not submit further GPU
work; retry disposes the previous scene and uses the latest settings.

Registry consumer qualification on 27 October 2026 used renderer 0.2.57 and shared
1.4.0 with no source overrides. Both 50/100 studies completed 64 samples/six
bounces/denoising at the workshop's 800x283 viewport. The existing diagnostics
asset pins also match shared 1.4.0. This establishes local released-dependency
behavior; public deployment remains a separate gate.
