export const demos = [
  {
    id: "integration-showcase",
    packageName: "@plasius/gpu-demo-viewer",
    type: "browser",
    mode: "Unified 3D integration showcase",
    runtime: "3D canvas + GLTF rigid bodies",
    launchLabel: "Open showcase",
    launchPath: "./showcase/",
    sourcePath: "./showcase/main.js",
    docsPath: "./README.md",
    command: "cd gpu-demo-viewer && npm run demo",
    summary: "Flag-by-the-sea 3D validation scene combining GLTF ships, cloth, fluid, lighting, debug telemetry, adaptive performance, and collisions.",
    notes: [
      "This is the top-level cross-package validation surface.",
      "The ships are loaded from GLTF and expose physics metadata used by the collision loop."
    ],
    tags: ["browser", "3d", "integration"]
  },
  {
    id: "gpu-camera",
    packageName: "@plasius/gpu-camera",
    type: "browser",
    mode: "State-only browser demo",
    runtime: "DOM state viewer",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-camera/demo/",
    sourcePath: "../gpu-camera/demo/main.js",
    docsPath: "../gpu-camera/README.md",
    command: "cd gpu-camera && npm run demo",
    summary: "Camera registration, switching, and multiview planning without a mounted 3D canvas.",
    notes: [
      "No WebGPU renderer is started in this demo by design.",
      "Use it to validate camera state transitions and render-plan output."
    ],
    tags: ["browser", "state"]
  },
  {
    id: "gpu-cloth",
    packageName: "@plasius/gpu-cloth",
    type: "browser",
    mode: "3D continuity demo",
    runtime: "3D harbor scene",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-cloth/demo/",
    sourcePath: "../gpu-cloth/demo/main.js",
    docsPath: "../gpu-cloth/README.md",
    command: "cd gpu-cloth && npm run demo",
    summary: "Cloth continuity preview in the shared 3D harbor scene with the flag as the primary near-field hero asset.",
    notes: [
      "This browser demo reuses the shared 3D showcase runtime for consistent visual validation.",
      "The flag cloth remains the package focus while ships, water, and lighting provide context."
    ],
    tags: ["browser", "3d"]
  },
  {
    id: "gpu-debug",
    packageName: "@plasius/gpu-debug",
    type: "browser",
    mode: "3D telemetry demo",
    runtime: "3D harbor scene + debug overlays",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-debug/demo/",
    sourcePath: "../gpu-debug/demo/main.js",
    docsPath: "../gpu-debug/README.md",
    command: "cd gpu-debug && npm run demo",
    summary: "Live debug telemetry surfaced alongside the same 3D harbor scene it is measuring.",
    notes: [
      "Queue depth, dispatch timing, frame cadence, and pipeline stages update against the active 3D scene.",
      "Use this when you want the telemetry to be tied to visible scene pressure."
    ],
    tags: ["browser", "3d"]
  },
  {
    id: "gpu-fluid",
    packageName: "@plasius/gpu-fluid",
    type: "browser",
    mode: "3D continuity demo",
    runtime: "3D harbor scene",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-fluid/demo/",
    sourcePath: "../gpu-fluid/demo/main.js",
    docsPath: "../gpu-fluid/README.md",
    command: "cd gpu-fluid && npm run demo",
    summary: "Fluid continuity preview in the shared 3D harbor scene with distance-banded water surfaces and consistent wave motion.",
    notes: [
      "The water surface stays continuous across near, mid, far, and horizon bands in the same scene.",
      "This replaces the earlier flat preview with a real 3D validation surface."
    ],
    tags: ["browser", "3d"]
  },
  {
    id: "gpu-lighting",
    packageName: "@plasius/gpu-lighting",
    type: "browser",
    mode: "3D lighting demo",
    runtime: "3D harbor scene + lighting overlays",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-lighting/demo/",
    sourcePath: "../gpu-lighting/demo/main.js",
    docsPath: "../gpu-lighting/README.md",
    command: "cd gpu-lighting && npm run demo",
    summary: "Distance-banded lighting preview in a 3D harbor scene with GLTF ships and live lighting policy overlays.",
    notes: [
      "The lighting package now presents a 3D canvas rather than a catalog-only page.",
      "Use it to validate lighting band behavior in visible context."
    ],
    tags: ["browser", "3d"]
  },
  {
    id: "gpu-lock-free-queue",
    packageName: "@plasius/gpu-lock-free-queue",
    type: "browser",
    mode: "2D queue visualization",
    runtime: "WebGPU compute + 2D canvases",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-lock-free-queue/demo/",
    sourcePath: "../gpu-lock-free-queue/demo/main.js",
    docsPath: "../gpu-lock-free-queue/README.md",
    command: "cd gpu-lock-free-queue && npm run demo",
    summary: "Spectrogram-based queue visualization that validates the lock-free GPU queue on live canvases.",
    notes: [
      "Requires localhost or HTTPS because WebGPU must run in a secure context.",
      "The display is 2D visualization, not a 3D scene."
    ],
    tags: ["browser", "2d"]
  },
  {
    id: "gpu-particles",
    packageName: "@plasius/gpu-particles",
    type: "browser",
    mode: "2D particle preview canvases",
    runtime: "WebGPU compute + 2D canvases",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-particles/demo/",
    sourcePath: "../gpu-particles/demo/main.js",
    docsPath: "../gpu-particles/README.md",
    command: "cd gpu-particles && npm run demo",
    summary: "GPU particle scenes rendered into 2D preview canvases for fire, sparks, rain, snow, and fireworks.",
    notes: [
      "Requires localhost or HTTPS because the particle simulation depends on WebGPU.",
      "The canvases show GPU-driven buffers, but this is not a 3D world renderer."
    ],
    tags: ["browser", "2d"]
  },
  {
    id: "gpu-performance",
    packageName: "@plasius/gpu-performance",
    type: "browser",
    mode: "3D adaptive-performance demo",
    runtime: "3D harbor scene + governor overlays",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-performance/demo/",
    sourcePath: "../gpu-performance/demo/main.js",
    docsPath: "../gpu-performance/README.md",
    command: "cd gpu-performance && npm run demo",
    summary: "Adaptive frame-budget governor shown against a live 3D harbor scene instead of a synthetic chart.",
    notes: [
      "Quality changes now have visible 3D consequences across cloth, fluid, and lighting.",
      "Stress mode lets you watch the governor step detail down and recover."
    ],
    tags: ["browser", "3d"]
  },
  {
    id: "gpu-physics",
    packageName: "@plasius/gpu-physics",
    type: "browser",
    mode: "3D physics demo",
    runtime: "3D harbor scene + stable snapshot overlays",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-physics/demo/",
    sourcePath: "../gpu-physics/demo/main.js",
    docsPath: "../gpu-physics/README.md",
    command: "cd gpu-physics && npm run demo",
    summary: "Stable-world-snapshot physics validation in a 3D harbor scene with GLTF ships, authoritative collisions, and visual follow-up context.",
    notes: [
      "The demo now mounts a 3D browser scene instead of a CLI-only example.",
      "Use it to inspect authoritative collision ordering, snapshot handoff, and downstream visual consumers."
    ],
    tags: ["browser", "3d"]
  },
  {
    id: "gpu-renderer",
    packageName: "@plasius/gpu-renderer",
    type: "browser",
    mode: "3D canvas demo",
    runtime: "WebGPU canvas renderer",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-renderer/demo/",
    sourcePath: "../gpu-renderer/demo/main.js",
    docsPath: "../gpu-renderer/README.md",
    command: "cd gpu-renderer && npm run demo",
    summary: "Mounted WebGPU canvas demo for the renderer runtime with live start, stop, and step controls.",
    notes: [
      "Requires localhost or HTTPS because the renderer depends on WebGPU.",
      "This is the baseline mounted 3D canvas demo for renderer validation."
    ],
    tags: ["browser", "3d"]
  },
  {
    id: "gpu-worker",
    packageName: "@plasius/gpu-worker",
    type: "browser",
    mode: "3D canvas demo",
    runtime: "WebGPU compute + 3D canvas",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-worker/demo/",
    sourcePath: "../gpu-worker/demo/main.js",
    docsPath: "../gpu-worker/README.md",
    command: "cd gpu-worker && npm run demo",
    summary: "Instanced simulation demo showing GPU queue-driven worker jobs feeding a mounted 3D scene.",
    notes: [
      "Requires localhost or HTTPS because the worker pipeline depends on WebGPU.",
      "Use it to validate high-throughput worker execution and scene output together."
    ],
    tags: ["browser", "3d"]
  },
  {
    id: "gpu-world-generator",
    packageName: "@plasius/gpu-world-generator",
    type: "browser",
    mode: "3D canvas demo",
    runtime: "Built Vite bundle + WebGPU canvas",
    launchLabel: "Open built demo",
    launchPath: "../gpu-world-generator/demo/dist/",
    sourcePath: "../gpu-world-generator/demo/main.js",
    docsPath: "../gpu-world-generator/demo/README.md",
    command: "cd gpu-world-generator/demo && npm run dev",
    summary: "Procedural terrain and water simulation demo with a mounted WebGPU canvas.",
    notes: [
      "The viewer launches the built static dist bundle for fast validation.",
      "Use the demo package directly when you need the source Vite workflow."
    ],
    tags: ["browser", "3d"]
  },
  {
    id: "gpu-xr",
    packageName: "@plasius/gpu-xr",
    type: "browser",
    mode: "Lifecycle browser demo",
    runtime: "WebXR capability viewer",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-xr/demo/",
    sourcePath: "../gpu-xr/demo/main.js",
    docsPath: "../gpu-xr/README.md",
    command: "cd gpu-xr && npm run demo",
    summary: "WebXR lifecycle and capability demo without binding a renderer canvas.",
    notes: [
      "No 3D surface is mounted by design in this demo.",
      "Use @plasius/gpu-renderer with gpu-xr when you want a rendered XR surface."
    ],
    tags: ["browser", "state"]
  }
];
