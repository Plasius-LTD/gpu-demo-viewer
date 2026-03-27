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
    summary: "Flag-by-the-sea 3D validation scene combining moonlit GLTF ships, lantern lighting, cloth, fluid, lighting, debug telemetry, adaptive performance, and mass-aware collisions.",
    notes: [
      "This is the top-level cross-package validation surface.",
      "The ships are loaded from GLTF and expose physics metadata used by the collision loop.",
      "The shared showcase now uses moonlight, ship lanterns, and heavier-vs-lighter hull responses to make collision reads more realistic."
    ],
    tags: ["browser", "3d", "integration"]
  },
  {
    id: "gpu-camera",
    packageName: "@plasius/gpu-camera",
    type: "browser",
    mode: "3D camera orchestration demo",
    runtime: "Shared 3D harbor scene + camera overlays",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-camera/demo/",
    sourcePath: "../gpu-camera/demo/main.js",
    docsPath: "../gpu-camera/README.md",
    command: "cd gpu-camera && npm run demo",
    summary: "Camera registration, switching, and multiview planning validated against a mounted 3D harbor scene.",
    notes: [
      "The scene is family-owned through gpu-shared while gpu-camera controls active-view and multiview planning state.",
      "Use it to validate camera transitions on a real 3D surface instead of a state-only page."
    ],
    tags: ["browser", "3d"]
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
    mode: "3D DAG queue demo",
    runtime: "Shared 3D harbor scene + scheduler overlays",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-lock-free-queue/demo/",
    sourcePath: "../gpu-lock-free-queue/demo/main.js",
    docsPath: "../gpu-lock-free-queue/README.md",
    command: "cd gpu-lock-free-queue && npm run demo",
    summary: "Priority-aware DAG queue validation surfaced on top of the shared 3D harbor scene.",
    notes: [
      "The package now validates roots, lanes, and dependency joins on the same 3D family-owned scene used elsewhere.",
      "Use it to inspect the queue architecture without dropping back to a 2D-only visualizer."
    ],
    tags: ["browser", "3d"]
  },
  {
    id: "gpu-particles",
    packageName: "@plasius/gpu-particles",
    type: "browser",
    mode: "3D particle contract demo",
    runtime: "Shared 3D harbor scene + particle overlays",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-particles/demo/",
    sourcePath: "../gpu-particles/demo/main.js",
    docsPath: "../gpu-particles/README.md",
    command: "cd gpu-particles && npm run demo",
    summary: "Particle effect manifests and snapshot policy visualized against the shared 3D harbor scene.",
    notes: [
      "The visual surface is shared, while the particle package still owns effect selection and worker-manifest policy.",
      "Use it to inspect effect roots and stable-world-snapshot requirements on a mounted 3D canvas."
    ],
    tags: ["browser", "3d"]
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
    id: "gpu-shared",
    packageName: "@plasius/gpu-shared",
    type: "browser",
    mode: "3D shared runtime demo",
    runtime: "Shared 3D harbor scene",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-shared/demo/",
    sourcePath: "../gpu-shared/demo/main.js",
    docsPath: "../gpu-shared/README.md",
    command: "cd gpu-shared && npm run demo",
    summary: "The shared 3D harbor runtime demo that the family-owned browser showcases build on top of.",
    notes: [
      "Use this to validate the core shared scene without package-specific overlays layered on top.",
      "This is the common 3D runtime surface used by the migrated family demos."
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
    mode: "3D representation-band demo",
    runtime: "Shared 3D harbor scene + world overlays",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-world-generator/demo/",
    sourcePath: "../gpu-world-generator/demo/main.js",
    docsPath: "../gpu-world-generator/demo/README.md",
    command: "cd gpu-world-generator && npm run demo",
    summary: "Chunk representation and worker-manifest policy validated on a mounted 3D harbor scene.",
    notes: [
      "The demo is now static-server friendly and no longer relies on a bundler-only browser entry.",
      "Use it to validate near/mid/far/horizon representation policy on the shared showcase surface."
    ],
    tags: ["browser", "3d"]
  },
  {
    id: "gpu-xr",
    packageName: "@plasius/gpu-xr",
    type: "browser",
    mode: "3D XR target demo",
    runtime: "Shared 3D harbor scene + XR pacing overlays",
    launchLabel: "Open browser demo",
    launchPath: "../gpu-xr/demo/",
    sourcePath: "../gpu-xr/demo/main.js",
    docsPath: "../gpu-xr/README.md",
    command: "cd gpu-xr && npm run demo",
    summary: "XR frame-target negotiation and worker-budget hints shown against a mounted 3D harbor scene.",
    notes: [
      "The demo now mounts a 3D scene while gpu-xr remains responsible for target negotiation, not rendering.",
      "Use it to compare inline versus immersive pacing policy on the family showcase."
    ],
    tags: ["browser", "3d"]
  }
];
