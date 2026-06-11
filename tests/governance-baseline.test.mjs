import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const packageJson = JSON.parse(
  readFileSync(path.join(repoRoot, "package.json"), "utf8")
);

test("package exposes canonical baseline validation scripts", () => {
  assert.equal(
    packageJson.scripts.build,
    "node scripts/verify-static-viewer-contract.cjs"
  );
  assert.match(packageJson.scripts.typecheck, /node --check index\.js/);
  assert.equal(packageJson.scripts.lint, "npm run typecheck");
  assert.equal(packageJson.scripts["pack:check"], "node scripts/verify-public-package.cjs");
});

test("baseline governance documents exist for the static viewer contract", () => {
  assert.ok(existsSync(path.join(repoRoot, "NFR.md")));
  assert.ok(existsSync(path.join(repoRoot, "docs", "adrs", "index.md")));
  assert.ok(
    existsSync(
      path.join(
        repoRoot,
        "docs",
        "adrs",
        "adr-0001-gpu-demo-viewer-governance-baseline.md"
      )
    )
  );
});

test("package is configured as a public npm package with CD", () => {
  assert.notEqual(packageJson.private, true);
  assert.equal(packageJson.publishConfig?.access, "public");
  assert.equal(packageJson.license, "Apache-2.0");
  assert.ok(packageJson.repository?.url?.includes("Plasius-LTD/gpu-demo-viewer"));
  assert.ok(existsSync(path.join(repoRoot, ".github", "workflows", "cd.yml")));
});
