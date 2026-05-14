# ADR-0001: Define static viewer governance and validation baseline

## Status

Accepted

## Context

`@plasius/gpu-demo-viewer` is a shared validation surface for GPU demos. It is
intended to be lightweight and static, but still needs baseline governance docs and
verification commands to remain release-safe and auditable across repo sweeps.

## Decision

- Add repository-level governance documentation required by default (`NFR.md`).
- Add ADR index and baseline ADR for public reasoning traceability.
- Introduce `typecheck` as the canonical syntax-validation gate for shipped
  browser entrypoints and manifest modules.
- Define `build` as a static-contract verification step rather than a bundler
  pipeline.
- Record a short changelog line for the baseline completion.

## Consequences

- The repo now has explicit governance expectations and deterministic checks for
  future governance and release reviews.
- Existing behavior and demo flows are unchanged; only process and validation
  entry points were strengthened.
