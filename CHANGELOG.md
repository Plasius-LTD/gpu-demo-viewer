# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to SemVer.

## [Unreleased]

- **Fixed**
  - Added `index.js` compatibility entry shims for the root viewer and the
    showcase so stale cached entry URLs do not 404 when the runtime loads from
    `main.js`.
  - Prefilled the root viewer with a working showcase target so the initial
    `Open showcase` action works before client-side hydration completes.
  - Clamped showcase telemetry queue depths so the embedded preview no longer
    throws on arrival when stress or spray counts spike.

### Added

- Shared 3D harbor showcase with GLTF ships and physics metadata for cross-package validation.
- Browser manifest coverage tests and a GLTF asset contract test.
- Added a physics focus mode for the shared showcase and promoted
  `gpu-physics` to a browser-backed 3D demo entry.

### Changed

- The viewer now classifies the cloth, fluid, lighting, performance, and debug demos as browser-based 3D visual examples.
- Strengthened the shared showcase lighting and shadow model so the harbor demos
  present a more ray-traced near-field look.
