# ADR 0005: Share the bounded Node model acquisition helper

Accepted for staged delivery, 18 October 2026. Feature site#1170, Story site#2308,
Task #62. The growing original-model catalogue must not put every source binary
in site Git history or duplicate the reviewed acquisition implementation.

Expose `model-library/acquire.js` as `@plasius/gpu-demo-viewer/model-library/acquire`.
This is a Node-only tooling boundary; browser entrypoints and public runtime APIs
remain unchanged. Preserve existing provider allowlists, SHA-256/length checks,
redirect rejection, two workers, deadlines, manual-source admission and byte
budgets. Callers select explicit batches and may impose tighter constraints.

The site materializes reviewed sources during normal CI/builds, then tests the
complete output and embeds it in its approved deployment artifact. A missing or
changed provider source fails the build. Original bytes and credits remain
traceable; package tarballs contain metadata/tools, never source binary bundles.

Export regression, existing acquisition failure tests, combined LCOV and approved
package CI/CD are required before the site consumes this boundary.
