import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

test("showcase index maps @plasius/gpu-shared to the installed browser entry", () => {
  const html = readFileSync(path.join(repoRoot, "showcase", "index.html"), "utf8");

  assert.match(
    html,
    /"@plasius\/gpu-shared": "\.\.\/node_modules\/@plasius\/gpu-shared\/dist\/index\.js"/
  );
});

test("showcase main imports the shared runtime from the public package surface", () => {
  const source = readFileSync(path.join(repoRoot, "showcase", "main.js"), "utf8");

  assert.match(source, /from "@plasius\/gpu-shared"/);
  assert.doesNotMatch(source, /node_modules\/@plasius\/gpu-shared\/dist/);
});
