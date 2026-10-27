# Complete catalogue rollout

Plan recorded 18 October 2026; counts below are a historical planning snapshot,
not current deployment status. See [Story 2308](https://github.com/Plasius-LTD/plasius-ltd-site/issues/2308)
for delivery evidence and current status. Parent Epic: site#2271;
Feature: site#1170. First-batch Story: site#2303; production Task: site#2305.

The research catalogue contains 75 distinct source assets/sets. Gem is explicitly
excluded by the user, leaving 74 production candidates. The 31-model release was
production-verified on 20 October 2026; its 199 resources are files, not models.
This next candidate adds nine qualified furniture/workshop sources with 64
resources (30,610,988 bytes). Source acquisition for later batches remains in
progress separately; those records are not included in this release candidate.

## Delivery sequence

1. Diagnose Mosquito In Amber using its unchanged source geometry, textures and
   material properties. Compare released rendering with isolated corrections;
   retain known-bad evidence. Resolve transport/import faults with tests in the
   owning `@plasius/*` package before updating consumers. Do not whiten the
   material, remove transmission, replace the model or hide defects with filtering.
2. Retain the excluded Gem research identity for provenance. Do not download or
   substitute it. Verify all eleven retained originals and their source credits.
3. Release qualified owning packages through approved main `cd.yml`, consume
   registry versions, and publish the eleven retained first-group models through site CI/CD.
4. Process the remaining 63 candidates in seven batches of nine, preserving
   catalogue order. An individual dependency or unresolved licence is explicitly
   held; it must not prevent unrelated candidates being inspected. Batch membership
   and per-model status are version controlled; GitHub Project issues own delivery.
5. Only after this original-model pass is available in production, begin a
   separately designed PVOX conversion pass using the existing Plasius voxel
   packages. Preserve original hashes/credits to support source-versus-voxel
   comparisons. No voxel runtime or format is reimplemented here.

## Qualification and publication

For every model record source identity, author, licence, original hashes,
chosen LOD, dependencies, transformations, triangle/texture/memory budgets,
supported extensions and any animation limitation. Floating Castle still needs
its upstream scan credits resolved. Large tree source bundles need suitable LODs;
do not increase existing runtime/download limits merely to admit them.

Reuse gpu-shared import/inspection, gpu-renderer, camera and model packages.
Keep one selected model in flight, cancel stale work and dispose GPU resources.
Lazy-load selected assets only; catalogue expansion must not download every asset
or add renderer code to the homepage. Acquisition retains strict hashes, source
allowlists, timeout, byte limits and bounded concurrency. Original binaries stay
out of npm packages and private file paths stay out of committed metadata.

Before public enablement: compare texture/material/silhouette appearance with
the source; test completed fixed sampling, progressive refinement, camera reset,
denoising off/on, errors, teardown, keyboard, 320px layout and UHD admission.
Record actual dimensions/counts and timings; a completed render is not evidence
of physical material accuracy or animation playback. Preserve source materials.

Tests cover batch identity/completeness, pending and failed assets, integrity,
cancellation, selection and release-manifest exclusion of unqualified entries.
Require relevant tests, type/lint/build/package checks, >=80% coverage and every
changed runtime source in LCOV. Shader coverage retains the standing exception.

Production inherits the stored `gpu-demo.scene-fidelity.enabled` feature flag
and existing GPU-route capability. Source catalogue qualification is distinct
from rollout authorization. No production environment-variable bypass is added.
Rollback uses the stored flag/capability and the prior approved deployment.
Record exact successful CI/CD, production asset hashes and sensitive backend
secretref mappings before closing any release-bearing item. Keep adaptive
transport qualification separate; its draft packages are not production inputs.

## Completion evidence

This document is the design, not a claim of additional published models. Batch
tracking must distinguish researched, acquired, imported, visually qualified and
production-verified counts. Missing/held models keep the overall work open.

## Fixed Amber qualification

The [qualification record](amber-fixed-qualification.json) binds the renderer
source and exact screenshot hashes for the original-source comparison. The
enclosed insect is now visible without the previous severe dark shell or bands.
All retained fixture categories completed fixed64 checks; Amber additionally
completed fixed256 with denoising off/on, camera reset/refinement and native
3840×2160 at one sample. These checks do not qualify adaptive transport or claim
complete cinematic presentation. Production verification remains a separate gate.

## Batch 1 acquisition

Six CC0 Poly Haven sources are acquired unchanged: Large Iron Gate, Modular
Factory Facade, Modular Fort 01, Modular Urban Apartments Facade, Modular Wooden
Pier and Dandelion 01. Their 60 files total 58,823,648 bytes. Provider MD5/length
checks and recorded SHA-256 inventories agree; glTF dependency closure is complete.
`models:download -- 1` selects only this batch; runtime review still loads one
model at a time. Floating Castle, Thatched Cottage and Diffuse Transmission Plant
remain outside the acquired set. No additional model is production-qualified by
this acquisition record.

## Batch 1 inspection

The [qualification record](batch-one-qualification.json) records all six source
models completing fixed64 and native 3840×2160 at one sample. The material reuse
correction in shared PR150 makes the factory kit usable without duplicating its
six materials across 263 primitives. Camera and quality controls remain the
shared inspection APIs. The modular sources remain separate kit pieces; the
dandelion source contains five plants spread apart. This qualification supports
source inspection and does not claim assembled environments or cinematic quality.
Production remains pending registry consumption and approved site deployment.

## Batch 2 acquisition

Grass Medium 01, Searsia Lucida, Boulder 01, Coastal Cliff 01 and Dead Tree Trunk
are acquired unchanged (25 files, 48,818,088 bytes). All five completed fixed64,
camera reset/refinement and native UHD1 inspection; see
[batch two evidence](batch-two-qualification.json). The workshop consumes
published renderer 0.2.51 and shared 1.1.8, including the camera scene-reuse fix.
Quality changes still reallocate the renderer; dense models can take several seconds.
Four LOD0 tree sources exceed the unchanged 500,000-triangle limit: Fir Tree 01
(6,982,937), Island Tree 01 (1,599,403), Jacaranda Tree (3,863,832) and Pine Tree 01
(17,182,252). These need deliberate LOD preparation before admission; increasing
the runtime budget or silently replacing their sources is not a qualification.

## Batch 3 acquisition

Nine original sources are acquired: pomegranate, shell, rock face, tree stump,
armchair, hat, boots, Sheen Chair and Sheen Cloth. Poly Haven resources retain
the provider MD5/length and local SHA-256 inventories. Khronos sources are pinned
to commit edc7c9e67c639d230715049ee31f9a96a6babbbe and checked against Git blob
identities before SHA-256 inventory. Both sheen examples are CC0 in their primary
source notices. Sheen Chair exposes its authored default material only; material
variant selection is not claimed. This acquisition record does not admit any
of these nine sources to production before visual qualification and site CI/CD.

All nine batch-three models completed fixed64, camera reset/refinement, denoising
off/on and native UHD1 using released packages, with no observed console errors.
See [batch three evidence](batch-three-qualification.json). Four boot meshes are
part of the source set; Sheen Chair retains its default authored material.
Production verification remains pending.

## Next release: furniture and workshop sources

Resume viewer Task #62 and site Story #2308 with the nine original batch-four
models. Recheck all nine with registry-installed shared and renderer packages,
without source overrides. Retain the prior source qualification as historical
evidence, add exact released-version checks and admit only models whose source,
materials, camera/refinement, denoising and native UHD checks pass. Keep later
acquired batches separate until their qualification is complete. Publish the
viewer catalogue and then the site through their approved workflows; verify the
40-model public selector and resource hashes before calling the batch live.

The next scene review will combine qualified assets into a furnished interior
and a workshop. Reuse the existing scene/loading/model packages and preserve
original model files, material maps, licences and source identities. Define and
track composition requirements before implementing reusable scene support. Test
scale, placement, shadows, colour interaction and combined resource budgets.
These composite scenes follow this model release and precede any voxel conversion.

## Batch 4 registry qualification

All nine original furniture/workshop models completed fixed64, camera reset and
refinement, denoising off/on and native 3840×2160 at one sample with released
renderer0.2.54 and shared1.1.12, without source overrides. No console warnings or
errors were observed. Source geometry, materials and textures remain unchanged;
sofa WebP maps are present. The [qualification record](batch-four-qualification.json)
retains the prior source-check context and binds the fresh screenshots by hash.
This is static inspection qualification, not animation playback or a claim of
complete material fidelity. Site production verification remains pending.

## Batch 5: tools and material studies

Continue Task #62 under Story site#2308 / Feature site#1170, inheriting
`gpu-demo.scene-fidelity.enabled` and the existing site capability. Qualify the
nine batch-five originals against released renderer0.2.54/shared1.2.0 with no
source overrides. The 58 resources total 75,722,699 bytes; preserve the existing
source manifests and attribution. Flight Helmet retains its original full texture
set and transmission material. Circuit Board retains its authored alpha modes.

Require source hash/length and glTF dependency closure checks, fixed64 sampling,
camera reset/refinement, denoising off/on and native UHD1 for each model. Record
actual GPU results and any unsupported material behavior before changing status
to qualified. Tests must pin the nine identities and keep unqualified batches
out of the published catalogue. Publish through viewer main/production CD, then
consume that release in the site and verify the 49-model candidate through the
site CI/CD path, public hashes/credits and live GPU checks. Failed candidates
remain held; the original-model target remains 74, with Gem excluded.

All nine batch-five originals completed the checks above; see the
[registry qualification record](batch-five-qualification.json). The flight
helmet's full texture set makes quality rebuilds take several seconds. A DOM
automation timeout left one transition incomplete; fresh selection recovered,
and native menu round trips between balanced and UHD completed. This limitation
and the interrupted capture are retained. The 320px layout completed fixed64
without horizontal overflow. No GPU console warnings or errors were observed.
Physical touch and screen-reader speech remain untested. Public verification
still depends on the approved package and site releases.

## Remaining acquired batches: sculpture and optical materials

Continue viewer Task #62 / site Story #2308 under Feature #1170 and its existing
scene-fidelity control. Batch six has seven acquired sources: Chess Set, Gothic
Statue, Kite Shield, Marble Bust, Brass Diya Lantern, Anisotropy Barn Lamp and
Commercial Refrigerator. Enchanted Crystal remains unavailable and A Beautiful
Game remains held for deliberate LOD work. Batch seven has nine acquired sources:
Magnifying Glass, Wine Bottles, Ship Pinnace, Iridescence Lamp, Iridescent Dish
with Olives, Stained Glass Lamp, Barramundi Fish, Materials Variants Shoe and Toy
Car. Preserve all original source identities and unchanged resource budgets.

Review each batch independently using released shared1.2.0/renderer0.2.54, no
source overrides, fixed64, camera/refinement, denoising off/on, native UHD1 and
source/texture/silhouette checks. Keep unsupported or visibly broken materials
held; completion alone does not qualify optical accuracy. Material-variant and
animation playback are not introduced. Pin complete resource hashes and credits,
test batch eligibility and held separation, and publish only qualified models
through approved package and site workflows. Verify all live additions and
public resource/credit hashes before updating production counts. Original-model
qualification precedes voxel conversion.


The 2026-10-21 registry review admitted seven batch-six and five batch-seven
sources. See [batch-six evidence](batch-6-qualification.json) and
[batch-seven evidence](batch-7-qualification.json). Wine Bottles retains speckling
at 256 samples; Iridescence Lamp has visible dark patching; the dish's glass
cover appears nearly opaque; Toy Car failed UHD twice and was followed by adapter
unavailability. These four remain held with their exact acquisition inventories
in [held-source evidence](batch-seven-held-sources.json), outside the runtime
catalogue. Do not replace their materials, reduce source fidelity silently, or
raise resource limits to make qualification pass.

The candidate contains 61 models. Production remains at the last independently
verified release until package publication, site CD and public checks complete.

## Instanced scene admission — 27 October 2026

Shared 1.4.0 replaces the historical 500,000-triangle guard with requested GPU
resource accounting and device limits. The four large tree sources above remain
unqualified: removing that guard does not establish their performance or memory
suitability. Dense studies reuse already reviewed vegetation and a separate pinned
Astronaut fixture; see [the dense-scene guide](dense-scene-studies.md).
