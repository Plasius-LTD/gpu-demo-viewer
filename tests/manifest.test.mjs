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

test("manifest covers every sibling gpu-* package with a demo directory", () => {
  const siblingPackages = readdirSync(workspaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name.startsWith("gpu-") && name !== "gpu-demo-viewer")
    .filter((name) => existsSync(path.join(workspaceRoot, name, "demo")))
    .sort();

  const manifestIds = new Set(demos.map((demo) => demo.id));
  for (const packageName of siblingPackages) {
    assert.ok(manifestIds.has(packageName), `${packageName} is included in the manifest`);
  }
});

test("manifest file targets resolve", () => {
  for (const demo of demos) {
    assert.ok(existsSync(fileURLToPath(new URL(demo.launchPath, manifestBaseUrl))), `${demo.id} launch path`);
    assert.ok(existsSync(fileURLToPath(new URL(demo.sourcePath, manifestBaseUrl))), `${demo.id} source path`);
    if (demo.docsPath) {
      assert.ok(existsSync(fileURLToPath(new URL(demo.docsPath, manifestBaseUrl))), `${demo.id} docs path`);
    }
  }
});
