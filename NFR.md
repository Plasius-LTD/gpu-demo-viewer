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
