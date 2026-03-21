# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to SemVer.

## [Unreleased]

- **Fixed**
  - Added `index.js` compatibility entry shims for the root viewer and the
    showcase so stale cached entry URLs do not 404 when the runtime loads from
    `main.js`.

### Added

- Shared 3D harbor showcase with GLTF ships and physics metadata for cross-package validation.
- Browser manifest coverage tests and a GLTF asset contract test.

### Changed

- The viewer now classifies the cloth, fluid, lighting, performance, and debug demos as browser-based 3D visual examples.
