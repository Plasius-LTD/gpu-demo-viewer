# ADR 0004: Model-library quality controls

Accepted for implementation, 2026-10-14. Parent Feature Plasius-LTD/plasius-ltd-site#1170, Story #2303, viewer Task #58. Inherited flag `gpu-demo.scene-fidelity.enabled`; the existing localhost review override remains the only exposure in this delivery.

The viewer supplies semantic native controls for sample target, bounce depth, render width and denoising. gpu-shared owns camera/renderer lifecycle and idle scheduling; gpu-renderer accumulates linear samples before presentation. No duplicate rendering implementation lives here. The sample counter reflects GPU-completed work and the progress element has an accessible label. Controls reflow at 320px and inherit native keyboard/touch behavior. Quality changes retain the current camera and model; document visibility pauses refinement.

Default: 64 samples, six bounces, 800px width and denoising. Width options 480/800/1280 preserve the visible canvas aspect ratio within the shared 1440px dimension bound. GPU work stops at the selected target. Source credits, deferred assets and known defects remain visible.

`PLASIUS_RENDERER_SOURCE` permits an explicit absolute development entrypoint alongside the shared source override, only on the localhost development server. Published dependencies must replace both overrides after approved upstream CD. No production route or capability is added. Rollback removes the review query/overrides or disables the inherited remote flag in public hosts.

## UHD extension (2026-10-14)

Add exact HD/QHD/UHD presets alongside viewport-shaped widths. Fixed presets do not change on viewport resize. Use contained presentation to avoid stretching and retain exact traced dimensions in the progress label. Shared admission caps the total at UHD pixels. See [design](../model-inspection-uhd.md).
