import { mountGpuShowcase } from "../shared/showcase-runtime.js";

await mountGpuShowcase({
  root: document.getElementById("app"),
  focus: "integrated",
  packageName: "@plasius/gpu-demo-viewer",
  title: "Flag by the Sea",
  subtitle:
    "Unified 3D validation scene with GLTF ships, colliding rigid bodies, cloth, fluid continuity, lighting bands, adaptive performance, and telemetry.",
});
