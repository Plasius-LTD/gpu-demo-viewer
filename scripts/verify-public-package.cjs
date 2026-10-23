const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const complianceFiles = [
  "LICENSE",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "legal/CLA.md",
  "legal/INDIVIDUAL_CLA.md",
  "legal/CORPORATE_CLA.md"
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(repoRoot, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function packDryRunFiles(repoRoot) {
  const result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 30000,
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

function verifyPublicPackage(repoRoot = path.resolve(__dirname, "..")) {
  const packageJson = readJson(repoRoot, "package.json");

  assert(packageJson.name === "@plasius/gpu-demo-viewer", "package name must remain scoped");
  assert(packageJson.private !== true, "public package must not set private=true");
  assert(
    packageJson.publishConfig?.access === "public",
    "public package must publish with public npm access"
  );
  assert(packageJson.license === "Apache-2.0", "package license is required");
  assert(packageJson.repository?.url?.includes("Plasius-LTD/gpu-demo-viewer"), "repository metadata is required");
  assert(packageJson.exports?.["."] === "./viewer-manifest.js", "viewer manifest must be the package root export");

  // Inspect metadata before packing; never read contributor acceptance records.
  const legalDirectory = fs.lstatSync(path.join(repoRoot, "legal"));
  assert(legalDirectory.isDirectory(), "legal must be a real directory");
  for (const file of complianceFiles) {
    const stat = fs.lstatSync(path.join(repoRoot, file));
    assert(stat.isFile() && stat.size > 0, `${file} must be a non-empty regular file`);
  }

  const files = packDryRunFiles(repoRoot);
  const fileSet = new Set(files);
  const requiredFiles = [
    "CHANGELOG.md",
    ...complianceFiles,
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
    assert(
      !file.startsWith("legal/") || complianceFiles.includes(file),
      `package tarball contains unapproved legal document: ${file}`
    );
    assert(!file.startsWith("node_modules/"), `package tarball must not include ${file}`);
    assert(!file.startsWith("tests/"), `package tarball must not include ${file}`);
    assert(!file.startsWith(".git/"), `package tarball must not include ${file}`);
    assert(!file.startsWith(".tmp"), `package tarball must not include ${file}`);
  }

  process.stdout.write("Public package contract verified.\n");
}

module.exports = { verifyPublicPackage };

if (require.main === module) {
  try {
    verifyPublicPackage();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
