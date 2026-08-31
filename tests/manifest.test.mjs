import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { demos } from "../viewer-manifest.js";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const manifestBaseUrl = new URL("../viewer-manifest.js", import.meta.url);
const expectedGpuDemoPackages = [
  "gpu-camera",
  "gpu-cloth",
  "gpu-debug",
  "gpu-fluid",
  "gpu-lighting",
  "gpu-lock-free-queue",
  "gpu-particles",
  "gpu-performance",
  "gpu-physics",
  "gpu-renderer",
  "gpu-shared",
  "gpu-worker",
  "gpu-world-generator",
  "gpu-xr",
];

test("manifest ids are unique", () => {
  const ids = demos.map((demo) => demo.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("manifest covers the committed gpu-* demo package inventory", () => {
  const manifestPackages = demos
    .map((demo) => demo.id)
    .filter((id) => id.startsWith("gpu-"))
    .sort();
  assert.deepEqual(manifestPackages, expectedGpuDemoPackages);
});

test("manifest file targets resolve", () => {
  for (const demo of demos) {
    const launchPath = fileURLToPath(new URL(demo.launchPath, manifestBaseUrl));
    const sourcePath = fileURLToPath(new URL(demo.sourcePath, manifestBaseUrl));

    if (launchPath.startsWith(repoRoot)) {
      assert.ok(existsSync(launchPath), `${demo.id} launch path`);
    } else {
      assert.match(demo.launchPath, /^\.\.\/gpu-[^/]+\//, `${demo.id} launch path shape`);
    }

    if (sourcePath.startsWith(repoRoot)) {
      assert.ok(existsSync(sourcePath), `${demo.id} source path`);
    } else {
      assert.match(demo.sourcePath, /^\.\.\/gpu-[^/]+\//, `${demo.id} source path shape`);
    }

    if (demo.docsPath) {
      const docsPath = fileURLToPath(new URL(demo.docsPath, manifestBaseUrl));
      if (docsPath.startsWith(repoRoot)) {
        assert.ok(existsSync(docsPath), `${demo.id} docs path`);
      } else {
        assert.match(demo.docsPath, /^\.\.\/gpu-[^/]+\//, `${demo.id} docs path shape`);
      }
    }
  }
});

test("browser demos in the catalog expose mounted 3D surfaces", () => {
  const browserDemos = demos.filter((demo) => demo.type === "browser");
  for (const demo of browserDemos) {
    assert.ok(
      demo.tags.includes("3d"),
      `${demo.id} should advertise a mounted 3D validation surface`
    );
  }
});
