# ADR 0010: Lazy scalable forest studies

Status: Accepted. Date: 2026-10-28. Task #95; site Story #2342; Feature #1170.

## Decision

Keep the original composite and denseStudyDefinitions APIs intact. Add
scalableStudyDefinitions with source keys, model counts, camera framing and lazy
createPlacements. The local catalogue resolves its model array on selection and
caches source request manifests. Extend placement tuples with an optional fifth
primitive-selection entry, consumed by the shared scene runtime.

Use three tiers with 1,000, 5,000 and 10,000 of each source type. Select one
Searsia variant explicitly so individual shrub counts are honest. Hosts own
asset permissions, credits, qualification and GPU budgets; the viewer owns layout.
Renderer storage and shared runtime implementation remain in their own packages.

## Rollout

Production consumers inherit gpu-demo.scene-fidelity.enabled and
site.studio-coming-soon.view through the existing remote evaluator. Use those
controls or the previous approved deployment for rollback. Release via approved
main cd.yml/production, with GPU qualification and package provenance recorded
before production consumption. No changed source may be absent from LCOV.
