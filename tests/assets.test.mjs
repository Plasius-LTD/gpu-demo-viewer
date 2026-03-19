import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

test("brigantine gltf ships include physics metadata", () => {
  const assetPath = path.join(repoRoot, "assets", "brigantine.gltf");
  const asset = JSON.parse(readFileSync(assetPath, "utf8"));
  const physics = asset.nodes?.[0]?.extras?.physics;
  assert.ok(physics, "physics extras are present");
  assert.equal(physics.shape, "box");
  assert.ok(Array.isArray(physics.halfExtents));
  assert.equal(physics.halfExtents.length, 3);
  assert.ok(physics.mass > 0);
  assert.ok(physics.restitution >= 0);
});
