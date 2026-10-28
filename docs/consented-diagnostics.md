# Consented showcase diagnostics

Design for gpu-demo-viewer#42, Story site#1671, Feature site#1665.

Only a mount owned by this package can register `site.gpu-demo`. A new focused
entrypoint will mount the fixed baseline harbour using the published shared
runtime, four integrity-pinned procedural public assets, and the native renderer.
It will retain the runtime privately. It will accept no caller-provided surface
ID, provenance, scene, model, renderer loader, snapshot, warning or URL. Open
model-library studies, generator, arbitrary canvases and `/player-system` remain
ineligible. Asset failure, fallback rendering, no submitted frame, disposal or
unknown provenance disables diagnostics.

The host supplies a fresh remote decision for `feedback.game-diagnostics.enabled`,
`feedback.game-diagnostics.attach`, and `gpu-demo.scene-fidelity.enabled`.
Missing decisions deny access. This package adds no service endpoint or local
production override. The panel requires explicit unchecked consent and a preview
action before reading observations. Copy rechecks remote access; consent changes,
refresh, disposal and races clear or invalidate pending work. Normal structured
reporting is independent. Rollback disables the diagnostics flag.

Only native renderer/backend and coarse viewport buckets are observed. Timing is
unknown because existing showcase telemetry includes synthetic stress values.
No raw scene/debug snapshot is passed to the renderer helper. That released helper
constructs the closed packet, then the shared parser validates it. Preview is
read-only text; copying is an explicit clipboard operation. No automatic capture,
upload, download, browser storage, cache entry, analytics or log is introduced.

Alternatives: accepting any source-tagged object would permit forged provenance;
using `render_game_to_text` would disclose scene details; collecting images would
violate the Feature. This narrow mount adds a supported validation surface rather
than assuming every existing demo is eligible. Site integration/reconstruction is
the separate downstream site#1677.

Validation: tests derive from deny/allow/rollback/provenance/consent/lifetime
requirements, with changed-source LCOV, static package checks and real browser
keyboard/320px/no-pixel network/storage/cache checks. Release only via PR CI and
exact-main `cd.yml` in `production`, then verify npm artifact and provenance.

## Dependency and compatibility decision

The direct shared dependency changes from `^1.2.0` (locked 1.2.0) to exact 1.3.0.
This adopts the published diagnostics contract verified under shared#101 and
fixes the bytes used by the four SRI entries. The renderer remains locked to
0.2.54, with its existing compatible manifest range. Shared 1.3.0 brings its
declared model-conversion dependency graph; this mount explicitly disables
conversion and lazily loads the shared runtime only for a positive scene
decision. No unrelated direct dependency is updated. Package audits and
signature/attestation verification cover the new locked graph. A future shared
version requires an explicit asset/hash compatibility review rather than
silently accepting changed assets.

## Instancing dependency qualification — 27 October 2026

The dense-scene release advances the exact shared dependency to 1.4.0 and the
renderer range/lock to ^0.2.57/0.2.57. The existing four SHA-384 asset pins match
the published 1.4.0 bytes without changes; tests also confirm their resources
remain self-contained. The diagnostics public exports, access/consent boundaries
and source-owned mount are unchanged. Instanced model studies do not become
eligible diagnostics sources. See [ADR 0009](adrs/adr-0009-instanced-crowd-studies.md).

## Scalable-scene dependency qualification — 28 October 2026

The scalable-scene release advances the exact shared dependency to 1.5.0 and
the renderer range/lock to ^0.2.58/0.2.58. The four existing SHA-384 asset pins
are retained and checked against the installed public package by the regression
suite. This dependency update preserves the diagnostics consent and source
boundaries; the new forest studies do not become eligible diagnostics sources.

## Browser qualification — 21 October 2026

An isolated in-app Chromium tab mounted the actual published shared/native
WebGPU renderer, with the four SRI-pinned assets. The local harness supplied
test access decisions only; no production controls changed. Keyboard activation
prepared the closed packet; explicit Copy reported success. No-consent preview
was denied. Revoking access immediately before Copy cleared preview and consent;
unchecking consent and disposal also removed retained diagnostics. A 320px-wide
panel had no horizontal overflow. This is actual narrow-container validation,
not an emulated 320px device viewport or a full multi-browser qualification.

The harness trapped canvas export/readback and display capture. It recorded
four public-asset fetches at mount, zero later fetches, zero non-GET requests,
zero request bodies and zero pixel reads. Resource entries stayed at 36 across
preview/copy/revocation; localStorage, sessionStorage, Cache Storage and IndexedDB
stayed empty. This combines browser observations with source/invariant tests;
it does not claim arbitrary third-party host code cannot perform network I/O.
No Chrome/Firefox/Safari cross-browser pass is inferred. Clipboard denial has a
tested selectable-preview fallback.

NFR disposition: security/privacy checked by integrity, closed packet, no-pixel,
rollback and race tests plus browser isolation evidence; accessibility checked
for labels, keyboard activation, live status, visible focus, contrast and 44px
action targets; performance checked through lazy loading and absence of new
sampling loops; reliability/reproducibility checked by clean install, build,
asset hashes and lifetime tests; maintainability/testability checked by ADR,
focused public entrypoint and changed-source LCOV; observability uses fixed
user-visible status messages without raw diagnostics logging. SEO is N/A for a
package subpath that creates no public route. Backend sensitive-environment
mapping is N/A because no backend or Azure resource changes are made.


## Access/source recovery — Task42 regression

The source lifetime follows the initial scene decision. The public mount reads
remote access again after awaiting the source; a scene denial or resolver failure
disposes the private runtime before revealing controls. A later scene denial also
ends that lifetime. A grant cannot create a source during refresh. Instead,
`refreshAccess()` resolves to `{status: 'remount-required'}` while controls stay
hidden; the host destroys the old handle and explicitly mounts again with fresh
decisions. This also covers an initial resolver rejection or missing scene grant.
No automatic remount, asset retry or synthetic provenance is introduced.

Other statuses are `available`, `unavailable`, `superseded` and `disposed`.
Feature/capability-only revocation clears consent but permits refresh recovery
when the original scene remains authorized. Overlapping actions cannot apply a
stale grant; destruction invalidates pending refresh/preview/copy work. The handle
still exposes only refreshAccess/destroy and hosts that ignore refresh results
remain compatible. Hosts should surface remount recovery through their ordinary
reporting UI; denied users never see unusable diagnostic controls.

The private lifecycle coordinator is testable with delayed sources; the public
entrypoint accepts no loader/runtime override. Regression tests cover initial
rejection and denial then grant, revocation during delayed mounting, refresh races,
consent clearing, disposal during pending refresh and healthy source recovery.
The existing published shared1.4.0/renderer dependencies and all asset hashes are
unchanged by this fix.


Browser regression qualification on 28 October 2026 confirmed the real public
mount stays hidden after initial resolver failure followed by a grant and returns
`remount-required`. A deterministic private source fixture then exercised the
changed lifecycle/panel in Chromium: explicit remount, unchecked consent, denied
preview without consent, keyboard preview, explicit copy, scene revocation,
hidden remount-required recovery, and disposal. The 320px panel did not overflow;
fetches/pixel reads/storage/cache/database entries remained zero during that
fixture flow. This fixture is not exposed through the public mount.

Native WebGPU requalification was attempted but this browser session could not
obtain a GPU adapter. An earlier local harness attempt also failed because Vite
prebundling relocated asset URLs; disabling prebundling resolved that harness
problem. Neither attempt is counted as a successful native-renderer run. Native
rendering/source implementation, published dependency versions and asset bytes
are unchanged; the prior native qualification above remains historical evidence.
No full browser/device matrix or new native-renderer performance result is claimed.

The current-action guard covers source disposal as well as panel visibility: an
older scene denial resolving after a newer successful refresh is superseded and
cannot destroy the newer authorized source. The inverse race (stale grant after
new denial) and disposal during a pending denial are regression-tested too.
