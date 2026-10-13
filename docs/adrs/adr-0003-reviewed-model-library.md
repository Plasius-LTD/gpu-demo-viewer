# ADR 0003: Reviewed model library

Status: Accepted for local inspection.

The viewer acquires the exact first-twelve shortlist with pinned provenance, file sizes and SHA-256 hashes. Ten are available for this pass; the user deferred the two Sketchfab downloads. Asset binaries remain outside Git and npm. `models:download` retrieves only the reviewed Poly Haven and pinned Khronos URLs, with two workers, sixty-second requests, no redirects and a 200 MiB aggregate budget. Existing files must match the manifest. Credits travel with each installed model.

Rendering, glTF decoding, material projection and input gestures belong to the shared `model-inspection` package entry. The viewer owns selection, cancellation, readable errors, credits and review observations. It does not replace missing assets or apply the chest-specific ageing system indiscriminately. Only one model is active. Resize remounts a bounded render target; hidden/missing assets have explicit states.

The parent control is `gpu-demo.scene-fidelity.enabled`. This validation surface uses the explicit localhost-only `?review=first-twelve` override. It adds no production route or entitlement. Product integration must use the remote flag and existing route capabilities. Rollback: omit the query override, stop the local server, or revert the viewer entry.

Tests cover acquisition rejection/integrity, rapid selection races, cleanup, missing assets, source credits, static-animation caveats and disabled state. Browser screenshots and review notes distinguish files loaded from visual fidelity achieved.
