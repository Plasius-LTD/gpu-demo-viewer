import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const workflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/cd.yml"),
  "utf8",
);
const ciWorkflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/ci.yml"),
  "utf8",
);

test("trusted validation uses the quarantined self-hosted runner group", () => {
  assert.match(
    ciWorkflow,
    /if: \$\{\{ github\.event_name != 'pull_request' \|\| github\.event\.pull_request\.head\.repo\.full_name == github\.repository \}\}/u,
  );
  assert.match(ciWorkflow, /group: Public CI - Quarantined/u);
  assert.match(ciWorkflow, /labels: \[self-hosted, Linux, X64\]/u);
  assert.doesNotMatch(ciWorkflow, /pull_request_target|CI_RUNNER_LABELS/u);
});

test("npm release uses hosted OIDC without a long-lived write token", () => {
  assert.match(workflow, /runs-on: ubuntu-latest/u);
  assert.match(workflow, /environment: production/u);
  assert.match(workflow, /id-token: write/u);
  assert.match(workflow, /npm publish/u);
  assert.doesNotMatch(workflow, /NPM_TOKEN|NODE_AUTH_TOKEN/u);
});

test("npm release admits only the prepared main commit after exact CI", () => {
  assert.match(workflow, /Enforce exact-main successful CI/u);
  assert.match(workflow, /needs\.prepare_release\.outputs\.commit_sha/u);
  assert.match(workflow, /refs\/remotes\/origin\/main/u);
  assert.match(workflow, /-f branch=main/u);
  assert.match(workflow, /-f event=push/u);
  assert.match(workflow, /-f head_sha="\$\{EXPECTED_SHA\}"/u);
  assert.match(workflow, /conclusion == "success"/u);
});

test("release recovery peels annotated tags to their target commit", () => {
  assert.match(
    workflow,
    /git rev-list -n 1 "refs\/tags\/\$\{TAG\}"/u,
  );
  assert.doesNotMatch(
    workflow,
    /git ls-remote origin "refs\/tags\/\$\{TAG\}"/u,
  );
});

test("npm release fails closed when npm OIDC is unavailable", () => {
  assert.match(workflow, /Verify release runtime/u);
  assert.match(workflow, /ACTUAL_NODE%%\.\*/u);
  assert.match(workflow, /"11\.5\.1"/u);
  assert.match(workflow, /--provenance/u);
});
