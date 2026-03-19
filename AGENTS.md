# AGENTS

## Scope
- `@plasius/gpu-demo-viewer` is the shared validation surface for Plasius `gpu-*` demos.

## Active Rules
- Prefer real visual validation over placeholder catalogs when package demos need to prove behavior.
- Keep shared showcase assets small and deterministic so browser-based validation stays fast.
- Treat GLTF asset metadata used for demo collisions as a tested contract.
- Update `README.md`, `CHANGELOG.md`, and manifest tests whenever demo targets change.

## Local Commands
- `npm run lint`
- `npm test`
- `npm run demo`
