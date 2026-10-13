# ADR 0003: Reviewed model library

Status: Accepted for local inspection.

The viewer acquires the exact first-twelve shortlist with pinned provenance, file sizes and SHA-256 hashes. Eleven are available: ten automatic downloads and the user-supplied Medieval house GLB. Gem remains deferred. Asset binaries remain outside Git and npm. `models:download` retrieves only the reviewed Poly Haven and pinned Khronos URLs, with two workers, sixty-second requests, no redirects and a 200 MiB aggregate budget. Existing files must match the manifest. Credits travel with each installed model.

Manual files have `acquisition: "manual"` and no download URL in the file record. Acquisition verifies their installed bytes and checksum exactly as it does automatic downloads; a missing manual file produces an actionable local destination message without a network request. User download paths are never stored in the catalogue. This supports supplied files without expanding the approved remote-source allowlist or attempting authenticated downloads.

Rendering, glTF decoding, material projection and input gestures belong to the shared `model-inspection` package entry. The viewer owns selection, cancellation, readable errors, credits and review observations. It does not replace missing assets or apply the chest-specific ageing system indiscriminately. Only one model is active. Resize remounts a bounded render target; hidden/missing assets have explicit states.

The parent control is `gpu-demo.scene-fidelity.enabled`. This validation surface uses the explicit localhost-only `?review=first-twelve` override. It adds no production route or entitlement. Product integration must use the remote flag and existing route capabilities. Rollback: omit the query override, stop the local server, or revert the viewer entry.

Tests cover acquisition rejection/integrity, rapid selection races, cleanup, missing assets, source credits, static-animation caveats and disabled state. Browser screenshots and review notes distinguish files loaded from visual fidelity achieved.
