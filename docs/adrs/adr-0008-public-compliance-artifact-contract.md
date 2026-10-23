# ADR 0008: Public compliance artifact contract

Status: Accepted 2026-10-23

## Context

Project Task gpu-demo-viewer#35 under operational task site#847 requires the
schema-template legal baseline and package-level guarantees. The previous
verifier allowed publication without security/contribution policies or legal
templates. This is repository-operational compliance maintenance; it changes no
product Feature, remotely controlled behaviour or entitlement. Flags and
capabilities are N/A for this packaging-only task.

## Decision

Reuse the three unsigned templates from @plasius/schema main
`d8f8eb430c77b8a98da496a3d8382d73d6297394`, substituting only the package name.
Preserve Apache-2.0 package licensing and existing model-specific licences.
Include SECURITY.md and CONTRIBUTING.md and explicitly list each legal template
in package.json. Do not include a broad legal directory glob. Signed agreements
and acceptance records stay outside source control in the approved restricted
system; they are never package inputs.

The Node-built-in verifier checks metadata for non-empty regular compliance
files and a real legal directory. It pins SHA-256 digests of all three adapted
templates to exact approved bytes before invoking a bounded npm dry-run. Future
legal changes require reviewed baseline/digest and test updates together;
non-empty truncation, rewording or added terms must fail. It then
requires all six documents in the manifest and rejects any unapproved legal
entry. It does not read private contributor records. Its root argument permits
isolated test fixtures without mutating the working checkout. CI and CD invoke
the same pack check; no new runtime dependency or public runtime API is needed.

## Alternatives

Repository-only documents would not satisfy the requested artifact baseline.
Including all of legal/ would make accidental document additions package inputs.
Checking source presence alone would miss package allowlist regressions. A new
shared package is unnecessary for these local filesystem checks.

## Tests and NFR implications

Requirements-derived regressions remove, empty, symlink or omit each required
document and exercise actual npm dry-runs. Tampering regressions truncate,
reword and append to every template, and independently pin their approved hashes.
Positive fixtures prove the complete contract passes, while synthetic unlisted records stay excluded or fail packing.
Tests never create actual agreements or personal information. Source/helper
coverage, frozen install, audit, build and package checks establish reproducible
and maintainable validation. Viewer runtime, browser/GPU behaviour, accessibility,
SEO and performance are unchanged; no browser qualification or Azure secretref
change applies. Existing NFR.md remains the runtime baseline.

## Release and rollback

Deliver through PR, successful CI, protected main and the existing cd.yml
production/OIDC prepare-publish route. Verify a fresh package version and compare
all required document bytes with the released source and sealed tarball. Do not
manually promote changelog sections or publish locally. Correct packaging defects
through an ordinary forward release; never roll back by publishing private
records or restoring fail-open validation. No site consumer deployment is needed.
