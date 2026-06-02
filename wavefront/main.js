import {
  createWavefrontPathTracingComputeConfig,
  createWavefrontPathTracingComputeRenderer,
  rendererWavefrontComputeMode,
  rendererWavefrontComputeWorkgroupSize,
  supportsWavefrontPathTracingCompute,
} from "@plasius/gpu-renderer";

const FEATURE_FLAG = "gpu.wavefrontPathTracingDemo";

const resolutionModes = Object.freeze({
  preview: Object.freeze({ width: 640, height: 360, samples: 1 }),
  hd720: Object.freeze({ width: 1280, height: 720, samples: 1 }),
  hd1080: Object.freeze({ width: 1920, height: 1080, samples: 1 }),
  uhd4k: Object.freeze({ width: 3840, height: 2160, samples: 1 }),
});

let activeRenderer = null;
let activeSignature = "";
let lastStats = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function primaryRayCount(settings) {
  return settings.width * settings.height * settings.samples;
}

function normalizeResolutionKey(value, capture) {
  if (value === "capture" || value === "balanced") {
    return "hd720";
  }
  if (value === "detail") {
    return "hd1080";
  }
  if (value && resolutionModes[value]) {
    return value;
  }
  return capture ? "hd720" : "hd720";
}

function createSettings() {
  const params = new URLSearchParams(window.location.search);
  const capture = params.has("capture");
  const resolutionKey = normalizeResolutionKey(params.get("resolution"), capture);
  const resolution = resolutionModes[resolutionKey];
  const requestedDepth = Number(params.get("maxDepth"));
  const maxDepth = Number.isInteger(requestedDepth)
    ? clamp(requestedDepth, 1, 8)
    : capture
      ? 6
      : 5;

  return {
    ...resolution,
    resolutionKey,
    maxDepth,
    capture,
    denoise: false,
    format: "rgba8unorm",
    experimentalEnabled:
      params.get("experimental") === "wavefront" ||
      params.get("quality") === "experimental" ||
      params.get("feature") === FEATURE_FLAG,
  };
}

function createRendererSignature(settings) {
  return [
    settings.width,
    settings.height,
    settings.samples,
    settings.maxDepth,
    settings.format,
  ].join(":");
}

function renderMetricList(root, metrics) {
  root.innerHTML = metrics
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
}

function renderBounceRows(root, stats) {
  if (!stats.bounces.length) {
    root.innerHTML = `<p class="empty-note">Stats readback disabled or no active bounce rows.</p>`;
    return;
  }

  const peak = Math.max(...stats.bounces.map((entry) => entry.active), 1);
  root.innerHTML = stats.bounces
    .map((entry) => {
      const width = Math.max(3, Math.round((entry.active / peak) * 100));
      return `
        <div class="bounce-row">
          <div class="bounce-row__top">
            <strong>Bounce ${entry.bounce}</strong>
            <span>${entry.active.toLocaleString()} active</span>
          </div>
          <div class="bounce-meter"><span style="width: ${width}%"></span></div>
          <div class="bounce-row__meta">
            <span>${entry.surfaceHits.toLocaleString()} surfaces</span>
            <span>${entry.emissiveHits.toLocaleString()} light</span>
            <span>${entry.environmentHits.toLocaleString()} skybox</span>
            <span>${entry.spawned.toLocaleString()} next</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function updateDebugOverlay(stats) {
  const settings = stats.settings;
  renderMetricList(document.getElementById("terminationStats"), [
    ["emissive", stats.termination.emissive.toLocaleString()],
    ["skybox", stats.termination.environment.toLocaleString()],
    ["ambient", stats.termination.ambientFallback.toLocaleString()],
    ["max depth", stats.termination.maxDepth.toLocaleString()],
  ]);
  renderMetricList(document.getElementById("contractStats"), [
    ["mode", stats.plan.mode],
    ["render", `${stats.renderMs.toFixed(1)} ms`],
    ["resolution", `${settings.width}x${settings.height}`],
    ["primary rays", primaryRayCount(settings).toLocaleString()],
    ["workgroups", stats.plan.dispatch.primaryWorkgroups.toLocaleString()],
    ["workgroup size", stats.plan.dispatch.workgroupSize],
    ["tiles", stats.plan.dispatch.tileCount?.toLocaleString() ?? "n/a"],
    [
      "tile size",
      stats.plan.dispatch.tileWidth
        ? `${stats.plan.dispatch.tileWidth}x${stats.plan.dispatch.tileHeight}`
        : "n/a",
    ],
    ["tile queue", stats.plan.queueCapacity.toLocaleString()],
    [
      "queue bytes",
      `${(stats.plan.queueCapacity * 80).toLocaleString()} each`,
    ],
    ["indirect bounces", stats.plan.dispatch.indirectDispatch ? "on" : "off"],
    [
      "output samples",
      stats.outputProbe
        ? `${stats.outputProbe.nonZeroSamples.toLocaleString()} / ${stats.outputProbe.sampledPixels.toLocaleString()}`
        : "not read",
    ],
    ["output max", stats.outputProbe ? stats.outputProbe.maxChannel : "not read"],
    ["cpu reference", settings.cpuReference ? "on" : "off"],
  ]);
  renderBounceRows(document.getElementById("bounceRows"), stats);
}

function updateControls(settings) {
  document.getElementById("maxDepthSelect").value = String(settings.maxDepth);
  document.getElementById("resolutionSelect").value = settings.resolutionKey;
  document.getElementById("postPassSelect").value = "resolve";
  document.getElementById(
    "captureLink"
  ).href = `./?experimental=wavefront&capture=1&resolution=hd720&maxDepth=${settings.maxDepth}`;
}

function createUrlFromControls() {
  const maxDepth = document.getElementById("maxDepthSelect").value;
  const resolution = document.getElementById("resolutionSelect").value;
  return `./?experimental=wavefront&resolution=${resolution}&maxDepth=${maxDepth}`;
}

async function getRenderer(canvas, settings) {
  const signature = createRendererSignature(settings);
  if (activeRenderer && activeSignature === signature) {
    return activeRenderer;
  }

  activeRenderer?.destroy();
  activeRenderer = await createWavefrontPathTracingComputeRenderer({
    canvas,
    width: settings.width,
    height: settings.height,
    samples: settings.samples,
    maxDepth: settings.maxDepth,
    denoise: settings.denoise,
    format: settings.format,
  });
  activeSignature = signature;
  return activeRenderer;
}

function setUnavailableState(status) {
  status.textContent =
    "WebGPU compute is required for this renderer demo. Use a secure localhost/HTTPS context and a browser with WebGPU enabled.";
  renderMetricList(document.getElementById("terminationStats"), [
    ["emissive", "n/a"],
    ["skybox", "n/a"],
    ["ambient", "n/a"],
    ["max depth", "n/a"],
  ]);
  renderMetricList(document.getElementById("contractStats"), [
    ["mode", "unavailable"],
    ["renderer", rendererWavefrontComputeMode],
    ["cpu reference", "off"],
    ["workgroup size", rendererWavefrontComputeWorkgroupSize],
  ]);
  renderBounceRows(document.getElementById("bounceRows"), { bounces: [] });
}

async function renderWebGpuFrame(canvas, status, settings) {
  if (!settings.experimentalEnabled) {
    status.textContent = "Open with ?experimental=wavefront to run the WebGPU path.";
    return;
  }

  if (!supportsWavefrontPathTracingCompute()) {
    setUnavailableState(status);
    return;
  }

  const config = createWavefrontPathTracingComputeConfig(settings);
  status.textContent = `Dispatching ${config.primaryRayCount.toLocaleString()} primary rays as ${config.primaryWorkgroups.toLocaleString()} WebGPU workgroups.`;
  const renderer = await getRenderer(canvas, settings);
  lastStats = await renderer.renderFrame({ readStats: true, readOutputProbe: true });
  updateDebugOverlay(lastStats);
  const outputProbe =
    lastStats.outputProbe == null
      ? "output probe unavailable"
      : `${lastStats.outputProbe.nonZeroSamples.toLocaleString()} / ${lastStats.outputProbe.sampledPixels.toLocaleString()} sampled output pixels non-zero`;
  status.textContent = `Rendered ${config.primaryRayCount.toLocaleString()} primary rays at ${settings.width} x ${settings.height} using ${rendererWavefrontComputeMode}; ${outputProbe}.`;
}

function boot() {
  const canvas = document.getElementById("renderCanvas");
  const status = document.getElementById("renderStatus");
  const mode = document.getElementById("renderMode");
  let settings = createSettings();

  updateControls(settings);
  mode.textContent = settings.experimentalEnabled
    ? `Feature flag: ${FEATURE_FLAG} enabled`
    : `Feature flag: ${FEATURE_FLAG} disabled`;

  const render = () => {
    settings = createSettings();
    updateControls(settings);
    mode.textContent = settings.experimentalEnabled
      ? `Feature flag: ${FEATURE_FLAG} enabled`
      : `Feature flag: ${FEATURE_FLAG} disabled`;
    requestAnimationFrame(() => {
      renderWebGpuFrame(canvas, status, settings).catch((error) => {
        status.textContent = `WebGPU wavefront render failed: ${error.message}`;
        console.error(error);
      });
    });
  };

  document.getElementById("renderButton").addEventListener("click", render);
  document.getElementById("maxDepthSelect").addEventListener("change", () => {
    window.history.replaceState(null, "", createUrlFromControls());
    render();
  });
  document.getElementById("resolutionSelect").addEventListener("change", () => {
    window.history.replaceState(null, "", createUrlFromControls());
    render();
  });
  document.getElementById("postPassSelect").addEventListener("change", () => {
    window.history.replaceState(null, "", createUrlFromControls());
    render();
  });
  render();
}

window.addEventListener("beforeunload", () => {
  activeRenderer?.destroy();
});

boot();
