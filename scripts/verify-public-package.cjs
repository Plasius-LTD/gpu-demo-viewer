const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function packDryRunFiles() {
  const result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_cache:
        process.env.PLASIUS_PACK_CHECK_NPM_CACHE ||
        path.join(os.tmpdir(), "plasius-gpu-demo-viewer-npm-cache")
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  assert(
    result.status === 0,
    `npm pack --dry-run failed:\n${result.stdout}\n${result.stderr}`
  );

  const [packInfo] = JSON.parse(result.stdout);
  assert(packInfo && Array.isArray(packInfo.files), "npm pack output did not include file metadata");
  return packInfo.files.map((file) => file.path).sort();
}

function main() {
  const packageJson = readJson("package.json");

  assert(packageJson.name === "@plasius/gpu-demo-viewer", "package name must remain scoped");
  assert(packageJson.private !== true, "public package must not set private=true");
  assert(
    packageJson.publishConfig?.access === "public",
    "public package must publish with public npm access"
  );
  assert(packageJson.license === "Apache-2.0", "package license is required");
  assert(packageJson.repository?.url?.includes("Plasius-LTD/gpu-demo-viewer"), "repository metadata is required");
  assert(packageJson.exports?.["."] === "./viewer-manifest.js", "viewer manifest must be the package root export");

  const files = packDryRunFiles();
  const fileSet = new Set(files);
  const requiredFiles = [
    "CHANGELOG.md",
    "LICENSE",
    "README.md",
    "assets/brigantine.gltf",
    "docs/adrs/index.md",
    "index.html",
    "main.js",
    "package.json",
    "showcase/index.html",
    "viewer-manifest.js",
    "wavefront/index.html",
    "wavefront/main.js"
  ];

  for (const requiredFile of requiredFiles) {
    assert(fileSet.has(requiredFile), `package tarball must include ${requiredFile}`);
  }

  for (const file of files) {
    assert(!file.startsWith("node_modules/"), `package tarball must not include ${file}`);
    assert(!file.startsWith("tests/"), `package tarball must not include ${file}`);
    assert(!file.startsWith(".git/"), `package tarball must not include ${file}`);
    assert(!file.startsWith(".tmp"), `package tarball must not include ${file}`);
  }

  process.stdout.write("Public package contract verified.\n");
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
