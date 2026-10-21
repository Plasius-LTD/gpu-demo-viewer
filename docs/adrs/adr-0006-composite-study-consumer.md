# ADR 0006: Consume shared composite inspection

Status: accepted. Date: 2026-10-21.
Feature: site#1170; Story site#2313; viewer Task #73.

The workshop needs to compare several originals under one camera and light.
Define small authored arrangements using installed catalogue keys, dimensions,
anchors and Y rotation. Expose them as composite studies alongside individual
model selection. Keep the count of acquired models distinct from the number of
views. Resolve complete integrity manifests through the existing fixture helper
and show every source's attribution and licence.

Consume `createSceneInspection` from the released shared package. Rendering,
loading, budgets, cancellation, camera and refinement remain shared-runtime
responsibilities. The viewer owns selection, composition data, credits and UI
lifecycle. Keep source overrides explicit and local to development; repeat
browser review with the registry package before release.

The existing scene-fidelity feature flag and route capability continue to govern
hosted product access. This local review does not add public-site navigation or
change the existing localhost review gate.

## Host-consumer contract — 21 October 2026

Story site#2321 / viewer Task #83 adds the typed `model-library/studies` subpath.
A pure function returns fresh copies of the same four layout definitions used by
the workshop. This keeps placement ownership here without coupling host apps to
the workshop UI, catalogue loading or its localhost gate. Hosts resolve their
own admitted sources and retain capability/rollout ownership. Shared inspection
still owns all rendering and resource limits. The local gate remains unchanged.
