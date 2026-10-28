# ADR 0007: Consented diagnostics from a source-owned curated showcase

Status: accepted for Task gpu-demo-viewer#42, Story site#1671, Feature site#1665.

The shared registration contract and renderer bucketing API do not establish
that a caller's arbitrary canvas or scene is curated. The open model library
can contain private or unqualified assets. Existing debug snapshots contain
coordinates, names and broad runtime state.

The new `feedback-diagnostics` package subpath owns a fixed baseline showcase
mount. Its public API accepts only render/control roots and a remote access
resolver. Source registration is fixed to `site.gpu-demo` on exact approved
routes; generator, `/player-system`, model-library and arbitrary runtime
injection are excluded. Four procedural public shared-package assets are
integrity-pinned to the published 1.3.0 release. Missing assets, fallback,
unsubmitted frames, unavailable renderers and destroyed mounts fail closed.
The raw runtime stays in a closure. Only explicit native backend and viewport
numbers reach the released renderer bucketing helper. Synthetic timing is
reported as unknown. The resulting packet is validated by the shared parser.

The host resolves `feedback.game-diagnostics.enabled`, capability
`feedback.game-diagnostics.attach`, and `gpu-demo.scene-fidelity.enabled`.
Publishing does not grant access. No environment or query override exists.
Explicit consent and preview precede observation. Copy rechecks access and
surface eligibility, and requires a packet identical to the reviewed preview.
Revocation, access refresh and disposal invalidate pending asynchronous work.
Disable the diagnostics flag to roll back; ordinary structured reports remain.
Hosts must call `refreshAccess()` on pushed control changes and destroy on route
exit. Remount after changing the scene rollout decision.

Accepting caller-supplied IDs/provenance or filtering generic debug snapshots
was rejected because neither proves a curated source. Adding capture or
transport was rejected because the Feature prohibits client pixels. The new
boundary exposes an accessible optional preview/copy UI and performs no upload,
storage, diagnostic logging or automatic collection.

Tests cover denial/allow/rollback, exact routes, source provenance, immutable
schema output, forbidden fields, race cancellation and lifetime. Browser checks
cover explicit user flow, mobile/keyboard access and network/cache isolation.
Release uses PR CI followed by exact-main `cd.yml` in `production`; verify the
npm artifact before downstream site#1677 adopts it. No backend or secret mapping
changes occur in this static package release.

The 27 October 2026 dependency update in ADR 0009 preserves all four asset hashes
against published shared 1.4.0. The source-admission and consent decisions above
remain unchanged; model-library stress scenes are still excluded.


### Recovery clarification — 28 October 2026

Rechecking access after asynchronous source mounting prevents stale initial
grants from exposing controls. Scene denial or failed scene verification destroys
that source. Refresh cannot resurrect an absent/destroyed source and returns an
additive `remount-required` status instead of exposing unusable controls. The host
explicitly destroys/remounts with fresh decisions; this preserves source ownership
and avoids automatic heavy imports, asset reloads and retry races. Automatic
source recreation was considered but rejected because it obscures the documented
scene lifetime and host resource budget. Feature/capability-only denial can
recover through refresh when scene access remains valid. Consent is always
cleared; stale refreshes/disposal cannot restore controls. Tests and browser
qualification cover this recovery before the normal patch-release pipeline.

The current-action guard covers source disposal as well as panel visibility: an
older scene denial resolving after a newer successful refresh is superseded and
cannot destroy the newer authorized source. The inverse race (stale grant after
new denial) and disposal during a pending denial are regression-tested too.
