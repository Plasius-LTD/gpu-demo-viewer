# ADR 0009: Instanced crowd studies

Status: Accepted. Date: 2026-10-27. Task #90; Story site#2336; Feature site#1170.

Add two explicit static stress studies: 50 and 100 astronauts, each with six
Quiver Tree placements and twelve complete Searsia Lucida shrub groups. Each
shrub source includes seven authored variants; preserve them and label groups
accurately. Layout definitions are fresh data returned by `denseStudyDefinitions`
in the existing typed studies export. Existing four composite definitions remain
stable. Hosts resolve only their admitted sources and own rollout/access decisions.

Use gpu-shared's explicit instancing option and renderer allocation reports. Do not
expand copies, duplicate shader logic or substitute lower-detail vegetation. Show
unique geometry, source/placement/mesh-instance counts and requested GPU resource
storage distinctly. The displayed byte figure is not physical VRAM or total browser
memory. Retain source credits once per unique asset with placement counts.

The Poly Astronaut GLB is a separately pinned, integrity-checked CC-BY-2.0 benchmark
source. Keep it in `benchmarkAssets` so the original 75 research identities and
74-model production target are not changed. `models:download -- crowd` acquires only
this asset plus the two existing vegetation sources through the bounded acquisition
helper. The original batch downloader and Gem exclusion retain their semantics.

No public access is enabled locally. The site continues to use
`gpu-demo.scene-fidelity.enabled` and `site.studio-coming-soon.view`. Complete
registry-package GPU qualification and approved production release before marking
this delivery complete. Static instances do not imply animation or voxel traversal.

Consume released shared 1.4.0 and renderer 0.2.57. The existing consented diagnostics
asset hashes are unchanged and verified against the new shared package; no wider
scene admission or diagnostics collection is introduced.
