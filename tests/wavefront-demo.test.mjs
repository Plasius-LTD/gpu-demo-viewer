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
  assert.match(html, /gpu-renderer\/dist\/index\.js/);
});

test("wavefront demo uses the renderer-owned WebGPU compute path", () => {
  const source = read("wavefront/main.js");
  assert.match(source, /createWavefrontPathTracingComputeRenderer/);
  assert.match(source, /createWavefrontPathTracingComputeConfig/);
  assert.match(source, /supportsWavefrontPathTracingCompute/);
  assert.match(source, /rendererWavefrontComputeMode/);
  assert.match(source, /rendererWavefrontComputeWorkgroupSize/);
  assert.match(source, /hd720/);
  assert.match(source, /hd1080/);
  assert.match(source, /uhd4k/);
  assert.match(source, /primaryRayCount/);
  assert.match(source, /readStats:\s*true/);
  assert.match(source, /indirect bounces/);
  assert.match(source, /readOutputProbe:\s*true/);
  assert.match(source, /outputProbe/);
  assert.match(source, /queue bytes/);
  assert.match(source, /cpu reference", "off"/);
  assert.match(source, /ambientFallback/);
  assert.doesNotMatch(source, /intersectSphere/);
  assert.doesNotMatch(source, /processWavefrontBounces/);
  assert.ok(repoRoot.endsWith("/gpu-demo-viewer/"), "test fixture resolves from repo root");
});
