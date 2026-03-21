import { mountGpuShowcase } from "../node_modules/@plasius/gpu-shared/dist/index.js";

const focus = new URLSearchParams(window.location.search).get("focus") ?? "integrated";

await mountGpuShowcase({
  root: document.getElementById("app"),
  focus,
  packageName: "@plasius/gpu-demo-viewer",
  title: focus === "physics" ? "Flag by the Sea: Physics Focus" : "Flag by the Sea",
  subtitle:
    focus === "physics"
      ? "Stable-world-snapshot validation scene with GLTF ships, authoritative collisions, downstream cloth and fluid continuity, and ray-traced lighting bands."
      : "Unified 3D validation scene with GLTF ships, colliding rigid bodies, cloth, fluid continuity, lighting bands, adaptive performance, and telemetry.",
});
