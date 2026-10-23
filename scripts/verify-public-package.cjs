const fs = require("node:fs");
const os = require("node:os");
const { createHash } = require("node:crypto");
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

// Approved schema d8f8eb430c77b8a98da496a3d8382d73d6297394, with only
// @plasius/schema replaced by @plasius/gpu-demo-viewer. Hash exact bytes.
const approvedTemplates = {
  "legal/CLA.md": "8e7de8348013f65a551d9a3179d4927cdce4ae15497ba209a0cf2c1098ba489c",
  "legal/INDIVIDUAL_CLA.md": "6ce945a06ee88d3c3103a6094123465440d8e9890a84956f257555cc9994fb39",
  "legal/CORPORATE_CLA.md": "f56606b1a8a563ca1bae67a9335f32ced1ce3827dec500bc28617de604c66608"
};

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

  for (const [file, expected] of Object.entries(approvedTemplates)) {
    const digest = createHash("sha256").update(fs.readFileSync(path.join(repoRoot, file))).digest("hex");
    assert(digest === expected, `${file} must match approved schema template`);
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
