# Contributing to @plasius/gpu-demo-viewer

This workspace utility exists to accelerate validation across the Plasius
`gpu-*` packages.

## Local Development

### Prerequisites

- Node.js 24 (`nvm use`)
- npm

### Validate

```bash
npm run lint
npm test
```

### Demo

```bash
npm run demo
```

Then open `http://localhost:8000/gpu-demo-viewer/`.

## Expectations

- Keep the viewer aligned with the real package demos; do not let the manifest drift.
- Add or update tests when browser target paths or shared showcase assets change.
- Update `README.md` and `CHANGELOG.md` whenever demo behavior or structure changes.
