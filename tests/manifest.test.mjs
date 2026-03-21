import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { demos } from "../viewer-manifest.js";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const workspaceRoot = path.resolve(repoRoot, "..");
const manifestBaseUrl = new URL("../viewer-manifest.js", import.meta.url);

test("manifest ids are unique", () => {
  const ids = demos.map((demo) => demo.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("manifest covers every sibling gpu-* demo package except dependency-only shared runtime packages", () => {
  const siblingPackages = readdirSync(workspaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name.startsWith("gpu-") && name !== "gpu-demo-viewer" && name !== "gpu-shared")
    .filter((name) => existsSync(path.join(workspaceRoot, name, "demo")))
    .sort();

  const manifestIds = new Set(demos.map((demo) => demo.id));
  for (const packageName of siblingPackages) {
    assert.ok(manifestIds.has(packageName), `${packageName} is included in the manifest`);
  }
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
