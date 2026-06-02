const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const repoRoot = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function requirePath(relativePath, label) {
  const fullPath = path.join(repoRoot, relativePath);
  assert(fs.existsSync(fullPath), `${label} is missing: ${relativePath}`);
  return fullPath;
}

function staticPathFromUrl(relativePath) {
  return relativePath.split(/[?#]/, 1)[0];
}

async function main() {
  requirePath("README.md", "README");
  requirePath("CHANGELOG.md", "CHANGELOG");
  requirePath("NFR.md", "NFR");
  requirePath("docs/adrs/index.md", "ADR index");
  requirePath(
    "docs/adrs/adr-0001-gpu-demo-viewer-governance-baseline.md",
    "Baseline ADR"
  );
  requirePath("index.html", "Root viewer entry");
  requirePath("main.js", "Root viewer runtime");
  requirePath("showcase/index.html", "Showcase entry");
  requirePath("showcase/main.js", "Showcase runtime");

  const { demos } = await import(pathToFileURL(requirePath("viewer-manifest.js", "Viewer manifest")).href);
  assert(Array.isArray(demos) && demos.length > 0, "viewer-manifest must export demos");

  for (const demo of demos) {
    assert(typeof demo.id === "string" && demo.id.length > 0, "demo.id is required");
    assert(typeof demo.launchPath === "string", `${demo.id} launchPath is required`);
    assert(typeof demo.sourcePath === "string", `${demo.id} sourcePath is required`);

    if (demo.launchPath.startsWith("./")) {
      requirePath(staticPathFromUrl(demo.launchPath.slice(2)), `${demo.id} launchPath`);
    }

    if (demo.sourcePath.startsWith("./")) {
      requirePath(staticPathFromUrl(demo.sourcePath.slice(2)), `${demo.id} sourcePath`);
    }

    if (typeof demo.docsPath === "string" && demo.docsPath.startsWith("./")) {
      requirePath(staticPathFromUrl(demo.docsPath.slice(2)), `${demo.id} docsPath`);
    }
  }

  process.stdout.write("Static viewer contract verified.\n");
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
