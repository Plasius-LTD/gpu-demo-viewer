const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { verifyPublicPackage } = require("../scripts/verify-public-package.cjs");

const repoRoot = path.resolve(__dirname, "..");
const complianceFiles = [
  "LICENSE", "SECURITY.md", "CONTRIBUTING.md",
  "legal/CLA.md", "legal/INDIVIDUAL_CLA.md", "legal/CORPORATE_CLA.md"
];
const otherFiles = [
  "CHANGELOG.md", "README.md", "assets/brigantine.gltf", "docs/adrs/index.md",
  "index.html", "main.js", "showcase/index.html", "viewer-manifest.js",
  "wavefront/index.html", "wavefront/main.js"
];

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "viewer-compliance-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  // No lifecycle hooks or dependencies run in artifact-only fixtures.
  delete pkg.scripts;
  delete pkg.dependencies;
  delete pkg.devDependencies;
  pkg.files = [...otherFiles, ...complianceFiles];
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify(pkg));
  for (const file of [...otherFiles, ...complianceFiles]) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), `unsigned fixture: ${file}\n`);
  }
  return root;
}

for (const file of complianceFiles) {
  test(`pack contract rejects missing ${file}`, (t) => {
    const root = fixture(t);
    fs.unlinkSync(path.join(root, file));
    assert.throws(() => verifyPublicPackage(root), new RegExp(file.replaceAll(".", "\\.")));
  });
  test(`pack contract rejects empty ${file}`, (t) => {
    const root = fixture(t);
    fs.writeFileSync(path.join(root, file), "");
    assert.throws(() => verifyPublicPackage(root), /non-empty regular file/);
  });
  // npm always includes LICENSE; test the remaining explicit allowlist entries.
  if (file !== "LICENSE") test(`pack contract rejects omitted artifact entry ${file}`, (t) => {
    const root = fixture(t);
    const manifestPath = path.join(root, "package.json");
    const pkg = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    pkg.files = pkg.files.filter((entry) => entry !== file);
    fs.writeFileSync(manifestPath, JSON.stringify(pkg));
    assert.throws(() => verifyPublicPackage(root), /package tarball must include/);
  });
}

test("pack contract rejects a directory in place of a document", (t) => {
  const root = fixture(t);
  fs.unlinkSync(path.join(root, "SECURITY.md"));
  fs.mkdirSync(path.join(root, "SECURITY.md"));
  assert.throws(() => verifyPublicPackage(root), /non-empty regular file/);
});

test("pack contract rejects a symlinked document", (t) => {
  const root = fixture(t);
  fs.unlinkSync(path.join(root, "SECURITY.md"));
  fs.symlinkSync("README.md", path.join(root, "SECURITY.md"));
  assert.throws(() => verifyPublicPackage(root), /non-empty regular file/);
});

test("pack contract rejects a symlinked legal directory", (t) => {
  const root = fixture(t);
  fs.renameSync(path.join(root, "legal"), path.join(root, "outside"));
  fs.symlinkSync("outside", path.join(root, "legal"));
  assert.throws(() => verifyPublicPackage(root), /legal must be a real directory/);
});

test("complete unsigned compliance baseline passes the actual npm dry-run", (t) => {
  verifyPublicPackage(fixture(t));
});

test("repository templates are unsigned schema baseline with package-name substitutions only", () => {
  for (const file of complianceFiles) {
    const stat = fs.lstatSync(path.join(repoRoot, file));
    assert.ok(stat.isFile() && stat.size > 0, `${file} must be a regular non-empty file`);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  for (const file of complianceFiles.filter((file) => file !== "LICENSE")) {
    assert.ok(manifest.files.includes(file), `${file} must have an explicit package allowlist entry`);
  }
  assert.ok(!manifest.files.includes("legal/"), "do not publish arbitrary legal records");
  for (const file of complianceFiles.filter((file) => file.startsWith("legal/"))) {
    const text = fs.readFileSync(path.join(repoRoot, file), "utf8");
    assert.doesNotMatch(text, /@plasius\/schema/);
    if (file !== "legal/CLA.md") assert.match(text, /@plasius\/gpu-demo-viewer/);
  }
  assert.match(fs.readFileSync(path.join(repoRoot, "legal/CLA.md"), "utf8"), /outside source control/);
});

for (const included of [false, true]) test(`unlisted legal fixture ${included ? "is rejected if packaged" : "stays outside the artifact"}`, (t) => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, "legal/unlisted-fixture.txt"), "synthetic exclusion fixture; no private data");
  if (included) {
    const manifestPath = path.join(root, "package.json");
    const pkg = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    pkg.files.push("legal/");
    fs.writeFileSync(manifestPath, JSON.stringify(pkg));
    assert.throws(() => verifyPublicPackage(root), /unapproved legal document/);
  } else verifyPublicPackage(root);
});
