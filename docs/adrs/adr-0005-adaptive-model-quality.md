# ADR 0005: Experimental adaptive model controls

Accepted for experimental implementation, 2026-10-14.

Add an explicit Fixed SPP / Adaptive radial (Experimental) selector alongside sample ceiling, bounces, resolution and denoising. Adaptive allows 20 bounces; fixed retains 12, with unavailable options disabled and a switch back clamped to 12. Show completed tiles, mean SPP and the requested ceiling. Explain centre-weighted allocation without calling it a variance or automatic performance governor.

Reuse gpu-shared for lifecycle and the optional renderer/lighting APIs for implementation. The localhost-only `?review=first-twelve` gate remains mandatory; `adaptiveEnabled:true` is a documented development override. Product hosts must compose `renderer.sampling.adaptivePerPixel.enabled`, `gpu-demo.scene-fidelity.enabled` and applicable capabilities. This task changes no remote flag, public route or production deployment.

Two additional absolute source overrides permit reviewed adaptive renderer and radial lighting builds alongside the fixed renderer. The adaptive subpath alias precedes the broad renderer alias. These overrides must be removed and final released dependencies tested before production delivery. UHD traces native 3840×2160 regardless of viewport size; the canvas remains contained. User interaction, hidden-tab pause and visible failures use the shared lifecycle. Rollback selects Fixed SPP or removes the localhost query. Viewer Task58 / Story2303 / Feature1170 depends on adaptive Feature2114.

See [integration design](../adaptive-model-inspection.md).
