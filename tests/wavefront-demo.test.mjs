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
  assert.match(html, /node_modules\/@plasius\/gpu-renderer\/dist\/index\.js/);
});

test("wavefront demo covers active-ray termination and continuation cases", () => {
  const source = read("wavefront/main.js");
  assert.match(source, /createWavefrontPathTracingPlan/);
  assert.match(source, /explicitLightSampling:\s*false/);
  assert.match(source, /kind:\s*"emissive"/);
  assert.match(source, /kind:\s*"reflective"/);
  assert.match(source, /kind:\s*"refractive"/);
  assert.match(source, /kind:\s*"water"/);
  assert.match(source, /kind:\s*"absorber"/);
  assert.match(source, /termination\.maxDepth/);
  assert.match(source, /smoothNormals:\s*true/);
  assert.ok(repoRoot.endsWith("/gpu-demo-viewer/"), "test fixture resolves from repo root");
});
