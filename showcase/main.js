import { mountGpuShowcase } from "@plasius/gpu-shared";

const focus = new URLSearchParams(window.location.search).get("focus") ?? "integrated";

await mountGpuShowcase({
  root: document.getElementById("app"),
  focus,
  packageName: "@plasius/gpu-demo-viewer",
  title: focus === "physics" ? "Flag by the Sea: Physics Focus" : "Flag by the Sea",
  subtitle:
    focus === "physics"
      ? "Stable-world-snapshot validation scene with moonlit GLTF ships, mass-aware collisions, lantern reflections, downstream cloth and fluid continuity, and ray-traced lighting bands."
      : "Unified moonlit 3D validation scene with GLTF ships, lantern-lit collisions, cloth, fluid continuity, lighting bands, adaptive performance, and telemetry.",
});
