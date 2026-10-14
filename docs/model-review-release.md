# Fixed progressive model review release

Task #58 / Story Plasius-LTD/plasius-ltd-site#2303 / Feature #1170. Release the existing reviewed acquisition catalogue, static-model inspection journey and fixed quality controls (samples, bounces, denoising, native UHD). Use published renderer0.2.49 and shared1.1.7; no local source aliases are part of the package dependency contract.

The localhost `?review=first-twelve` opt-in remains limited to local development. The website uses its separate server-side rollout and capability projection; the local viewer is not a production access-control mechanism. Adaptive controls from draftPR59 remain unreleased pending renderer qualification. This staged release does not close those open requirements.

The catalogue retains eleven acquired assets and one deferred Gem with exact source/licence/hash records; binaries remain acquired separately and are excluded from npm. Known visual findings remain visible, including amber transport banding and static-only Fox. Do not label the local review catalogue a visual approval. Validate tests/coverage, changed-source LCOV, syntax/build/package integrity, exact-head CI and approved main/production CD before publication.
