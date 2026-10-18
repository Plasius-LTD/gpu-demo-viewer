# Complete catalogue rollout

Status: delivery in progress, 18 October 2026. Parent Epic: site#2271;
Feature: site#1170. First-batch Story: site#2303; production Task: site#2305.

The research catalogue contains 75 distinct source assets/sets. Gem is explicitly
excluded by the user, leaving 74 production candidates: eleven retained from
the original twelve and 63 further models. Eleven have been acquired and ten
are currently selectable in production.
The 52 deployed files are geometry/texture resources, not 52 models.

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
