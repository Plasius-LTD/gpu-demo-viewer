# Non-Functional Requirements for @plasius/gpu-demo-viewer

## 1. Purpose

This document defines non-functional requirements for the shared GPU demo viewer.
The repo is static validation tooling with embedded catalog metadata and browser
entry surfaces.

## 2. Security

- No secrets, auth credentials, or environment-derived runtime values may be
  committed in viewer source assets or manifest files.
- Third-party scripts or network resources used by demos must remain explicit and
  auditable.

## 3. Reliability and Determinism

- Demo manifest and showcase definitions must be stable, deterministic, and
  mechanically testable.
- Existing demo tests must continue to cover manifest shape and asset compatibility.

## 4. Build and Validation

- Validation baseline for this repo is: `npm run lint`, `npm run test`,
  `npm run typecheck`, and `npm run build`.
- New baseline controls should not require browser execution for static verification.

## 5. Rollout and Documentation

- This viewer is intentionally non-user-facing runtime infrastructure.
- Baseline operations are governed by the parent feature flag:
  `platform.repo-hardening-sweep.enabled`.

## Model library review

Inherits `gpu-demo.scene-fidelity.enabled` with a localhost-only fixture override. Model changes abort prior work and release its GPU resources. Downloads use trusted reviewed hosts, no redirects, strict byte/hash limits and bounded concurrency. Preserve source licences. Keep missing downloads and renderer defects visible. Keyboard, touch, reduced-motion and 320px layouts must remain usable.

## Consented diagnostics

Task #42 inherits `feedback.game-diagnostics.enabled` and the host-evaluated
`feedback.game-diagnostics.attach` capability. The separate diagnostics mount
has no local/query override. Source-owned native mounts use four SRI-pinned
public baseline assets from published shared 1.3.0; fallback or unqualified
surfaces are ineligible. No scene/canvas/DOM/debug snapshot crosses the
diagnostics boundary. Timing is unknown rather than synthetic precision.
No automatic collection, diagnostic request, cache, storage or analytics is
permitted. Explicit preview/copy must remain keyboard accessible at 320px;
consent/access changes and disposal cancel pending work. Preserve the ordinary
structured-only reporting path on denial or rollback. Requirements and evidence
are recorded in [the design](docs/consented-diagnostics.md) and ADR 0007.
