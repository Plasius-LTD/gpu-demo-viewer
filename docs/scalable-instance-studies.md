# Scalable instance studies

Date: 2026-10-28. Task #95; site Story #2342; Feature #1170.
Controls: gpu-demo.scene-fidelity.enabled and site.studio-coming-soon.view.

Each tier places equal numbers of Astronaut, Quiver Tree 01 and the first authored
Searsia Lucida variant. The pinned Searsia glTF lists seven mesh nodes, each with
three material primitives; decoded primitive indices [0,1,2] select its first node.
The shared runtime recomputes that selection's bounds. Source bytes, integrity
manifests and credits remain unchanged. The trees contain two mesh primitives,
astronauts one, shrubs three; including the ground, the expected GPU mesh instance
counts are 6,001, 30,001 and 60,001 for 3,000, 15,000 and 30,000 model placements.

Scene extents and initial cameras scale with the tier. Each cell contains one of
each model, separated in ten scene units. Sizes are illustrative, not surveyed
physical dimensions. Every tier uses the same unique source geometry and
materials; only instances, transforms and TLAS nodes scale with count.

## Qualification

Record real-GPU results for all tiers at 800×500, 16 and 64 samples, six bounces
and denoising. Capture first-sample and completion time, exact counts, requested
and peak GPU storage, camera reset, teardown and controlled budget rejection.
Keep screenshots and machine-readable evidence with the linked delivery. Additional
resolutions are independent measurements, not implied by a successful base tier.

The local workshop is a review surface. A production host must consume released
packages, verify its own feature/capability gates and expose only qualified tiers.
Requested GPU bytes exclude opaque driver overhead and other tabs; browser memory
includes decoded source data and CPU acceleration structures. Avoid presenting
these different measurements as interchangeable.

## Local source qualification results

All three tiers completed 16 and 64 SPP at 800×500, six bounces and denoising on
28 October 2026. Requested storage was 290.37 / 295.82 / 302.69 MiB for the three
tiers, with the same 265,135 unique triangles. The largest tier reset and refined
again without allocation growth, then disposed to zero tracked bytes. Exact
timings, JSON and screenshots are retained in the task workspace under
output/scalable-scenes-2026-10-28. These are session measurements; another GPU
workshop was open in Chrome, so they are not isolated throughput benchmarks.
Registry package and production-host qualification remain separate gates.

Additional local qualification: the 30,000-placement tier completed native
1920×1080 at 16 and 64 SPP, six bounces and denoising. The 64-SPP run reached its
first sample in 8.887 s and completed in 106.450 s; requested and peak storage
remained 391,041,216 bytes (372.93 MiB). These are session measurements, with the
same concurrency caveat as the base-tier results.

The additional native 3840×2160 / 16-SPP trial failed before its first sample
with an external-instance `OperationError`, after requesting 664,948,416 bytes
(634.14 MiB), within the 1 GiB budget. Disposal reported zero tracked bytes. This
is evidence that resource admission alone cannot guarantee driver execution.
UHD for these forest tiers is **not qualified**; retain the 800×500 / 64-SPP /
six-bounce / denoising baseline and explicit recovery controls. The failure and
subsequent recovery observations are retained with the local evidence.

After the UHD failure, retrying the largest tier at 800×500 / 16 SPP completed
in 13.609 s without reloading the page, then disposed to zero tracked bytes.

Adapter evidence reports vendor `apple`, architecture `metal-3`; the browser
does not expose the precise device name. A subsequent largest-tier baseline run
completed 16 SPP in 14.999 s and again disposed to zero tracked GPU bytes.
