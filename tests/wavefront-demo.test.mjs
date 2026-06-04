import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { demos } from "../viewer-manifest.js";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

function read(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("wavefront path tracing demo is exposed as an experimental browser demo", () => {
  const demo = demos.find((entry) => entry.id === "wavefront-path-tracing");
  assert.ok(demo, "wavefront demo is present in the manifest");
  assert.equal(demo.type, "browser");
  assert.equal(demo.packageName, "@plasius/gpu-renderer");
  assert.equal(demo.launchPath, "./wavefront/?experimental=wavefront");
  assert.ok(demo.tags.includes("experimental"));
  assert.ok(demo.tags.includes("3d"));
});

test("wavefront demo imports the renderer package public surface", () => {
  const html = read("wavefront/index.html");
  assert.match(html, /@plasius\/gpu-renderer/);
  assert.match(html, /\.\.\/node_modules\/@plasius\/gpu-renderer\/dist\/index\.js/);
  assert.match(html, /id="samplesSelect"/);
  assert.match(html, /id="denoiseSelect"/);
  assert.match(html, /id="toggleLoopButton"/);
  assert.match(html, /id="timingStack"/);
  assert.match(html, /id="timingLegend"/);
  assert.match(html, /<option value="uhd">4K target<\/option>/);
  assert.doesNotMatch(html, /id="postPassSelect"/);
});

test("wavefront demo uses the renderer mesh BVH path", () => {
  const source = read("wavefront/main.js");
  assert.match(source, /createWavefrontPathTracingComputeRenderer/);
  assert.match(source, /supportsWavefrontPathTracingCompute/);
  assert.match(source, /displayQuality:\s*true/);
  assert.match(source, /meshes:\s*createWavefrontDemoMeshes\(\)/);
  assert.match(source, /geometryMode:\s*"mesh-bvh-display-quality"/);
  assert.match(source, /primaryRayCount/);
  assert.match(source, /screenRayCount/);
  assert.match(source, /performancePhaseDefinitions/);
  assert.match(source, /updatePerformanceBreakdown/);
  assert.match(source, /GPU_SYNC_SAMPLE_INTERVAL/);
  assert.match(source, /dispatchMs/);
  assert.match(source, /gpuWaitMs/);
  assert.match(source, /label:\s*"GPU sync"/);
  assert.match(source, /shouldSyncGpu/);
  assert.match(source, /Number\.NaN/);
  assert.match(source, /probeMs/);
  assert.match(source, /paceMs/);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /samplesPerPixel:\s*settings\.samplesPerPixel/);
  assert.match(source, /samplesPerPixel = document\.getElementById\("samplesSelect"\)\.value/);
  assert.match(source, /\["maxDepthSelect", "resolutionSelect", "samplesSelect", "denoiseSelect"\]/);
  assert.match(source, /resolutionModes\[params\.get\("resolution"\)\]/);
  assert.match(source, /uhd:\s*Object\.freeze\(\{\s*width:\s*3840,\s*height:\s*2160/s);
  assert.match(source, /params\.has\("samplesPerPixel"\)/);
  assert.match(source, /params\.has\("maxDepth"\)/);
  assert.match(source, /document\.getElementById\("denoiseSelect"\)\.value/);
  assert.doesNotMatch(source, /postPassSelect/);
  assert.match(source, /materialKind:\s*"emissive"/);
  assert.match(source, /materialKind:\s*"metal"/);
  assert.match(source, /materialKind:\s*"dielectric"/);
  assert.match(source, /materialKind:\s*"transparent"/);
  assert.match(source, /denoise:\s*settings\.denoise/);
  assert.doesNotMatch(source, /sceneObjects/);
  assert.doesNotMatch(source, /intersectSphere/);
  assert.doesNotMatch(source, /intersectPlane/);
  assert.doesNotMatch(source, /type:\s*"sphere"/);
  assert.doesNotMatch(source, /type:\s*"box"/);
  assert.ok(repoRoot.endsWith("/gpu-demo-viewer/"), "test fixture resolves from repo root");
});
