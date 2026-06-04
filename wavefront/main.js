import {
  createRayTracingRenderPlan,
  createWavefrontPathTracingComputeRenderer,
  supportsWavefrontPathTracingCompute,
} from "@plasius/gpu-renderer";

const FEATURE_FLAG = "gpu.wavefrontPathTracingDemo";
const GPU_SYNC_SAMPLE_INTERVAL = 12;

const resolutionModes = Object.freeze({
  capture: Object.freeze({ width: 960, height: 540, samplesPerPixel: 8 }),
  balanced: Object.freeze({ width: 1280, height: 720, samplesPerPixel: 8 }),
  detail: Object.freeze({ width: 1920, height: 1080, samplesPerPixel: 8 }),
  uhd: Object.freeze({ width: 3840, height: 2160, samplesPerPixel: 4 }),
});

const environmentLighting = Object.freeze({
  environmentColor: Object.freeze([0.35, 0.43, 0.49, 1]),
  ambientColor: Object.freeze([0.018, 0.021, 0.025, 1]),
  environmentLighting: Object.freeze({
    horizonColor: Object.freeze([0.43, 0.52, 0.58, 1]),
    zenithColor: Object.freeze([0.07, 0.1, 0.14, 1]),
    sunDirection: Object.freeze([0.24, 0.82, -0.52]),
    sunColor: Object.freeze([2.2, 1.85, 1.35, 1]),
    intensity: 1.08,
    mode: 1,
    exposure: 1,
  }),
});

const performancePhaseDefinitions = Object.freeze([
  Object.freeze({ key: "dispatchMs", label: "dispatch", color: "#ebbc62" }),
  Object.freeze({ key: "gpuWaitMs", label: "GPU sync", color: "#58c6d1" }),
  Object.freeze({ key: "probeMs", label: "probe", color: "#b889ff" }),
  Object.freeze({ key: "overlayMs", label: "overlay", color: "#8fd16a" }),
  Object.freeze({ key: "paceMs", label: "RAF pace", color: "#7d8790" }),
]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize(vector) {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function createQuadMesh({
  id,
  corners,
  color,
  emission = [0, 0, 0, 1],
  materialKind = "diffuse",
  roughness = 0.72,
  metallic = 0,
  opacity = color[3] ?? 1,
}) {
  const [a, b, c] = corners;
  const normal = normalize(
    cross(
      [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
      [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
    )
  );

  return {
    id,
    positions: corners.flat(),
    indices: [0, 1, 2, 0, 2, 3],
    normals: [normal, normal, normal, normal].flat(),
    color,
    emission,
    materialKind,
    roughness,
    metallic,
    opacity,
  };
}

function createSmoothMesh({
  id,
  center,
  radius,
  color,
  materialKind = "diffuse",
  roughness = 0.36,
  metallic = 0,
  opacity = color[3] ?? 1,
  rings = 14,
  segments = 28,
}) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let ring = 0; ring <= rings; ring += 1) {
    const v = ring / rings;
    const theta = v * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let segment = 0; segment <= segments; segment += 1) {
      const u = segment / segments;
      const phi = u * Math.PI * 2;
      const normal = [
        Math.cos(phi) * sinTheta,
        cosTheta,
        Math.sin(phi) * sinTheta,
      ];
      positions.push(
        center[0] + normal[0] * radius,
        center[1] + normal[1] * radius,
        center[2] + normal[2] * radius
      );
      normals.push(normal[0], normal[1], normal[2]);
      uvs.push(u, v);
    }
  }

  const stride = segments + 1;
  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = ring * stride + segment;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  return {
    id,
    positions,
    indices,
    normals,
    uvs,
    color,
    materialKind,
    roughness,
    metallic,
    opacity,
  };
}

function createWavefrontDemoMeshes() {
  return [
    createQuadMesh({
      id: 100,
      corners: [
        [-3.1, -0.86, 2],
        [3.1, -0.86, 2],
        [3.1, -0.86, -3],
        [-3.1, -0.86, -3],
      ],
      color: [0.52, 0.6, 0.62, 1],
      materialKind: "metal",
      metallic: 0.25,
      roughness: 0.38,
    }),
    createQuadMesh({
      id: 101,
      corners: [
        [-3.1, -0.86, -3],
        [3.1, -0.86, -3],
        [3.1, 3, -3],
        [-3.1, 3, -3],
      ],
      color: [0.5, 0.49, 0.46, 1],
      roughness: 0.84,
    }),
    createQuadMesh({
      id: 102,
      corners: [
        [-3.1, -0.86, -3],
        [-3.1, 3, -3],
        [-3.1, 3, 2],
        [-3.1, -0.86, 2],
      ],
      color: [0.42, 0.52, 0.62, 1],
      roughness: 0.8,
    }),
    createQuadMesh({
      id: 103,
      corners: [
        [3.1, -0.86, -3],
        [3.1, -0.86, 2],
        [3.1, 3, 2],
        [3.1, 3, -3],
      ],
      color: [0.58, 0.46, 0.42, 1],
      roughness: 0.8,
    }),
    createQuadMesh({
      id: 104,
      corners: [
        [-0.72, 2.52, -0.92],
        [0.72, 2.52, -0.92],
        [0.72, 2.52, -1.92],
        [-0.72, 2.52, -1.92],
      ],
      color: [1, 0.93, 0.76, 1],
      emission: [9, 8.2, 6.4, 1],
      materialKind: "emissive",
      roughness: 0,
    }),
    createQuadMesh({
      id: 105,
      corners: [
        [-2.2, -0.42, 0.6],
        [1.5, -0.42, 0.6],
        [1.28, -0.42, -2.25],
        [-2.05, -0.42, -2.15],
      ],
      color: [0.43, 0.78, 0.9, 0.58],
      materialKind: "transparent",
      roughness: 0.05,
      opacity: 0.58,
    }),
    createSmoothMesh({
      id: 200,
      center: [-0.95, -0.08, -1.1],
      radius: 0.62,
      color: [0.72, 0.7, 0.64, 1],
      materialKind: "metal",
      metallic: 0.72,
      roughness: 0.18,
    }),
    createSmoothMesh({
      id: 201,
      center: [0.72, -0.2, -1.32],
      radius: 0.5,
      color: [0.54, 0.68, 0.78, 0.9],
      materialKind: "dielectric",
      roughness: 0.05,
      opacity: 0.9,
    }),
    createSmoothMesh({
      id: 202,
      center: [0.04, -0.32, -0.16],
      radius: 0.34,
      color: [0.05, 0.08, 0.13, 1],
      materialKind: "diffuse",
      roughness: 0.92,
    }),
  ];
}

function createSettings() {
  const params = new URLSearchParams(window.location.search);
  const capture = params.has("capture");
  const resolutionKey =
    params.get("resolution") && resolutionModes[params.get("resolution")]
      ? params.get("resolution")
      : capture
        ? "capture"
        : "balanced";
  const requestedDepth = params.has("maxDepth") ? Number(params.get("maxDepth")) : null;
  const resolution = resolutionModes[resolutionKey];
  const requestedSamples = params.has("samplesPerPixel")
    ? Number(params.get("samplesPerPixel"))
    : params.has("samples")
      ? Number(params.get("samples"))
      : null;

  return {
    ...resolution,
    resolutionKey,
    capture,
    maxDepth: Number.isInteger(requestedDepth)
      ? clamp(requestedDepth, 3, 8)
      : capture
        ? 6
        : 5,
    samplesPerPixel: Number.isInteger(requestedSamples)
      ? clamp(requestedSamples, 1, 16)
      : resolution.samplesPerPixel,
    denoise: params.get("denoise") !== "off",
    experimentalEnabled:
      params.get("experimental") === "wavefront" ||
      params.get("quality") === "experimental" ||
      params.get("feature") === FEATURE_FLAG,
  };
}

function screenRayCount(settings) {
  return settings.width * settings.height;
}

function primaryRayCount(settings) {
  return screenRayCount(settings) * settings.samplesPerPixel;
}

function renderMetricList(root, metrics) {
  root.innerHTML = metrics
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
}

function summarizeMemory(memory) {
  return `${(memory.totalHotBufferBytes / 1024 / 1024).toFixed(2)} MiB hot buffers`;
}

function renderBounceRows(root, maxDepth) {
  const plan = createRayTracingRenderPlan({
    snapshotId: "gpu-demo-viewer-wavefront-mesh-bvh",
    wavefront: {
      maxDepth,
      queueCapacity: 128 * 128,
    },
  });
  const passOrder = plan.wavefront.bounceSchedule[0]?.passOrder ?? [];

  root.innerHTML = Array.from({ length: maxDepth }, (_, bounce) => `
    <div class="bounce-row">
      <div class="bounce-row__top">
        <strong>Bounce ${bounce}</strong>
        <span>GPU queue pass</span>
      </div>
      <div class="bounce-meter"><span style="width: ${Math.max(14, 100 - bounce * 9)}%"></span></div>
      <div class="bounce-row__meta">
        ${passOrder.map((stage) => `<span>${stage}</span>`).join("")}
      </div>
    </div>
  `).join("");
}

function formatMs(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)} ms` : "pending";
}

function formatFps(value) {
  return Number.isFinite(value) ? value.toFixed(1) : "pending";
}

function createPerformanceState() {
  const phaseSamples = Object.fromEntries(
    performancePhaseDefinitions.map((phase) => [phase.key, []])
  );
  return {
    frameCount: 0,
    frameSamples: [],
    submitSamples: [],
    phaseSamples,
    lastBreakdown: null,
    lastFrameMs: Number.NaN,
    lastSubmitMs: Number.NaN,
    bestFrameMs: Number.POSITIVE_INFINITY,
    worstFrameMs: 0,
    startedAt: performance.now(),
  };
}

function recordPerformanceSample(performanceState, sample) {
  const frameMs = performancePhaseDefinitions.reduce(
    (total, phase) => {
      const value = sample[phase.key];
      return total + (Number.isFinite(value) ? Math.max(0, value) : 0);
    },
    0
  );
  performanceState.frameCount += 1;
  performanceState.lastFrameMs = frameMs;
  performanceState.lastSubmitMs = sample.dispatchMs;
  performanceState.bestFrameMs = Math.min(performanceState.bestFrameMs, frameMs);
  performanceState.worstFrameMs = Math.max(performanceState.worstFrameMs, frameMs);
  performanceState.lastBreakdown = Object.freeze({
    ...sample,
    frameMs,
  });
  performanceState.frameSamples.push(frameMs);
  performanceState.submitSamples.push(sample.dispatchMs);
  for (const phase of performancePhaseDefinitions) {
    if (Number.isFinite(sample[phase.key])) {
      performanceState.phaseSamples[phase.key].push(Math.max(0, sample[phase.key]));
    }
  }

  if (performanceState.frameSamples.length > 90) {
    performanceState.frameSamples.shift();
  }
  if (performanceState.submitSamples.length > 90) {
    performanceState.submitSamples.shift();
  }
  for (const phase of performancePhaseDefinitions) {
    if (performanceState.phaseSamples[phase.key].length > 90) {
      performanceState.phaseSamples[phase.key].shift();
    }
  }
}

function average(values) {
  if (values.length === 0) {
    return Number.NaN;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function valuesWithPending(values, pendingValue) {
  if (!Number.isFinite(pendingValue)) {
    return values;
  }
  return [...values, pendingValue];
}

function summarizePerformance(performanceState, stats, running, pendingSample = null) {
  const pendingFrameMs = pendingSample
    ? performancePhaseDefinitions.reduce(
        (total, phase) => {
          const value = pendingSample[phase.key];
          return total + (Number.isFinite(value) ? Math.max(0, value) : 0);
        },
        0
      )
    : Number.NaN;
  const averageFrameMs = average(valuesWithPending(performanceState.frameSamples, pendingFrameMs));
  const averageSubmitMs = average(
    valuesWithPending(performanceState.submitSamples, pendingSample?.dispatchMs)
  );
  const fps = Number.isFinite(averageFrameMs) && averageFrameMs > 0 ? 1000 / averageFrameMs : Number.NaN;
  const raysPerSecond = Number.isFinite(fps) && stats
    ? stats.primaryRays * fps
    : Number.NaN;
  const phaseAverages = performancePhaseDefinitions.map((phase) => {
    const averageMs = average(
      valuesWithPending(performanceState.phaseSamples[phase.key], pendingSample?.[phase.key])
    );
    const lastMs = pendingSample?.[phase.key] ?? performanceState.lastBreakdown?.[phase.key] ?? Number.NaN;

    return {
      ...phase,
      averageMs: Number.isFinite(averageMs) ? averageMs : 0,
      lastMs,
    };
  });
  const totalPhaseMs = phaseAverages.reduce((total, phase) => total + phase.averageMs, 0);
  const breakdown = phaseAverages.map((phase) => ({
    ...phase,
    percent: totalPhaseMs > 0 ? (phase.averageMs / totalPhaseMs) * 100 : 0,
  }));

  return {
    running,
    frameCount: performanceState.frameCount,
    lastFrameMs: performanceState.lastFrameMs,
    averageFrameMs,
    averageSubmitMs,
    bestFrameMs: Number.isFinite(performanceState.bestFrameMs)
      ? performanceState.bestFrameMs
      : Number.NaN,
    worstFrameMs: performanceState.worstFrameMs || Number.NaN,
    fps,
    raysPerSecond,
    breakdown,
    elapsedSeconds: (performance.now() - performanceState.startedAt) / 1000,
  };
}

function updatePerformanceBreakdown(performanceSummary) {
  const stack = document.getElementById("timingStack");
  const legend = document.getElementById("timingLegend");

  stack.innerHTML = performanceSummary.breakdown
    .map((phase) => `
      <span
        class="timing-stack__segment"
        title="${phase.label}: ${phase.percent.toFixed(1)}%, ${formatMs(phase.averageMs)} avg"
        style="width: ${phase.percent.toFixed(3)}%; background: ${phase.color};"
      ></span>
    `)
    .join("");
  legend.innerHTML = performanceSummary.breakdown
    .map((phase) => `
      <li>
        <span class="timing-swatch" style="background: ${phase.color};"></span>
        <span>${phase.label}</span>
        <strong>${phase.percent.toFixed(1)}%</strong>
        <code>${formatMs(phase.averageMs)}</code>
      </li>
    `)
    .join("");
  stack.setAttribute(
    "aria-label",
    `Frame timing breakdown: ${performanceSummary.breakdown
      .map((phase) => `${phase.label} ${phase.percent.toFixed(1)} percent`)
      .join(", ")}`
  );
}

function updatePerformanceOverlay({ stats, performanceSummary }) {
  updatePerformanceBreakdown(performanceSummary);
  renderMetricList(document.getElementById("performanceStats"), [
    ["loop", performanceSummary.running ? "running" : "paused"],
    ["fps avg", formatFps(performanceSummary.fps)],
    ["loop frame avg", formatMs(performanceSummary.averageFrameMs)],
    ["loop frame last", formatMs(performanceSummary.lastFrameMs)],
    ["submit avg", formatMs(performanceSummary.averageSubmitMs)],
    ["best frame", formatMs(performanceSummary.bestFrameMs)],
    ["worst frame", formatMs(performanceSummary.worstFrameMs)],
    ["frames", performanceSummary.frameCount.toLocaleString("en-GB")],
    [
      "primary rays/s",
      Number.isFinite(performanceSummary.raysPerSecond)
        ? performanceSummary.raysPerSecond.toLocaleString("en-GB", { maximumFractionDigits: 0 })
        : "pending",
    ],
    [
      "tile work",
      stats ? `${stats.tiles.toLocaleString("en-GB")} x ${stats.samplesPerPixel} spp` : "pending",
    ],
  ]);
}

function updateDebugOverlay({ stats, settings, probe, performanceSummary }) {
  updatePerformanceOverlay({ stats, performanceSummary });
  renderMetricList(document.getElementById("terminationStats"), [
    ["geometry", "mesh BVH"],
    ["display quality", stats.displayQuality ? "true" : "false"],
    ["mesh triangles", stats.triangleCount.toLocaleString("en-GB")],
    ["acceleration", stats.accelerationBuildMode],
  ]);
  renderMetricList(document.getElementById("contractStats"), [
    ["resolution", `${stats.width}x${stats.height}`],
    ["screen pixels", stats.screenRays.toLocaleString("en-GB")],
    ["samples / pixel", stats.samplesPerPixel.toLocaleString("en-GB")],
    ["primary samples", stats.primaryRays.toLocaleString("en-GB")],
    ["triangles", stats.triangleCount.toLocaleString("en-GB")],
    ["BVH nodes", stats.bvhNodeCount.toLocaleString("en-GB")],
    ["max depth", `${stats.maxDepth} bounces`],
    ["tiles", `${stats.tiles} @ ${stats.tileSize}px`],
    ["denoise", settings.denoise ? "on" : "off"],
    ["probe", probe ? probe.luminance.toFixed(4) : "pending"],
    ["memory", summarizeMemory(stats.memory)],
  ]);
  renderBounceRows(document.getElementById("bounceRows"), stats.maxDepth);
}

function updateControls(settings) {
  document.getElementById("maxDepthSelect").value = String(settings.maxDepth);
  document.getElementById("resolutionSelect").value = settings.resolutionKey;
  document.getElementById("samplesSelect").value = String(settings.samplesPerPixel);
  document.getElementById("denoiseSelect").value = settings.denoise ? "on" : "off";
  document.getElementById(
    "captureLink"
  ).href = `./?experimental=wavefront&capture=1&maxDepth=${settings.maxDepth}&samplesPerPixel=${settings.samplesPerPixel}&denoise=${settings.denoise ? "on" : "off"}`;
}

function createUrlFromControls() {
  const maxDepth = document.getElementById("maxDepthSelect").value;
  const resolution = document.getElementById("resolutionSelect").value;
  const samplesPerPixel = document.getElementById("samplesSelect").value;
  const denoise = document.getElementById("denoiseSelect").value;
  return `./?experimental=wavefront&resolution=${resolution}&maxDepth=${maxDepth}&samplesPerPixel=${samplesPerPixel}&denoise=${denoise}`;
}

function withTimeout(promise, ms, fallback) {
  let timer = null;
  return Promise.race([
    promise,
    new Promise((resolve) => {
      timer = window.setTimeout(() => resolve(fallback), ms);
    }),
  ]).finally(() => {
    if (timer !== null) {
      window.clearTimeout(timer);
    }
  });
}

async function renderWavefrontFrame(canvas, settings) {
  const renderer = await createWavefrontPathTracingComputeRenderer({
    canvas,
    width: settings.width,
    height: settings.height,
    maxDepth: settings.maxDepth,
    samplesPerPixel: settings.samplesPerPixel,
    tileSize: 128,
    displayQuality: true,
    denoise: settings.denoise,
    meshes: createWavefrontDemoMeshes(),
    camera: {
      position: [0, 0.5, 2.85],
      target: [-0.08, -0.12, -1.12],
      up: [0, 1, 0],
      fovYDegrees: 47,
    },
    ...environmentLighting,
  });
  return renderer;
}

async function readProbe(renderer, settings) {
  return withTimeout(
    renderer.readOutputProbe({
      x: Math.floor(settings.width / 2),
      y: Math.floor(settings.height / 2),
    })
      .catch(() => null),
    1500,
    null
  );
}

function installSnapshotHook({ renderer, stats, settings, probe, performanceSummary }) {
  window.render_game_to_text = () =>
    JSON.stringify({
      surface: "gpu-demo-viewer-wavefront",
      geometryMode: "mesh-bvh-display-quality",
      displayQuality: true,
      requiresMeshBvhForDisplayQuality: true,
      screenRays: screenRayCount(settings),
      primaryRays: primaryRayCount(settings),
      samplesPerPixel: settings.samplesPerPixel,
      renderer: renderer.getSnapshot(),
      stats,
      probe,
      performance: performanceSummary,
    });
  window.__plasiusWavefrontPerformance = performanceSummary;
}

function boot() {
  const canvas = document.getElementById("renderCanvas");
  const status = document.getElementById("renderStatus");
  const mode = document.getElementById("renderMode");
  const toggleLoopButton = document.getElementById("toggleLoopButton");
  const renderButton = document.getElementById("renderButton");
  const state = {
    renderer: null,
    settings: null,
    running: true,
    loopToken: 0,
    stats: null,
    probe: null,
    performance: createPerformanceState(),
    renderingFrame: false,
    lastFrameCompletedAt: Number.NaN,
  };

  function getPerformanceSummary() {
    return summarizePerformance(state.performance, state.stats, state.running);
  }

  function updateStatus(performanceSummary = getPerformanceSummary()) {
    if (!state.stats || !state.settings) {
      return;
    }
    status.textContent =
      `${performanceSummary.running ? "Looping" : "Paused"} at ${formatFps(performanceSummary.fps)} FPS, ` +
      `${screenRayCount(state.settings).toLocaleString("en-GB")} screen pixels, ` +
      `${primaryRayCount(state.settings).toLocaleString("en-GB")} primary samples, ` +
      `${state.stats.triangleCount.toLocaleString("en-GB")} mesh triangles.`;
  }

  function updateAllOverlays() {
    if (!state.stats || !state.settings) {
      return;
    }
    const performanceSummary = getPerformanceSummary();
    updateDebugOverlay({
      stats: state.stats,
      settings: state.settings,
      probe: state.probe,
      performanceSummary,
    });
    installSnapshotHook({
      renderer: state.renderer,
      stats: state.stats,
      settings: state.settings,
      probe: state.probe,
      performanceSummary,
    });
    updateStatus(performanceSummary);
  }

  async function renderOneFrame({ includeProbe = false } = {}) {
    if (!state.renderer || state.renderingFrame) {
      return;
    }
    state.renderingFrame = true;
    const startedAt = performance.now();
    const paceMs = Number.isFinite(state.lastFrameCompletedAt)
      ? Math.max(0, startedAt - state.lastFrameCompletedAt)
      : 0;
    try {
      const submitStartedAt = performance.now();
      const stats = state.renderer.renderOnce();
      const dispatchMs = performance.now() - submitStartedAt;
      const shouldSyncGpu =
        includeProbe ||
        state.performance.frameCount === 0 ||
        state.performance.frameCount % GPU_SYNC_SAMPLE_INTERVAL === 0;
      let gpuWaitMs = Number.NaN;
      if (shouldSyncGpu) {
        const gpuWaitStartedAt = performance.now();
        await withTimeout(
          state.renderer.device.queue.onSubmittedWorkDone?.() ?? Promise.resolve(),
          5000,
          null
        );
        gpuWaitMs = performance.now() - gpuWaitStartedAt;
      }
      state.stats = stats;
      let probeMs = 0;
      if (includeProbe || state.performance.frameCount === 1) {
        const probeStartedAt = performance.now();
        state.probe = await readProbe(state.renderer, state.settings);
        probeMs = performance.now() - probeStartedAt;
      }
      const pendingSample = {
        dispatchMs,
        gpuWaitMs,
        probeMs,
        overlayMs: 0,
        paceMs,
      };
      const overlayStartedAt = performance.now();
      const provisionalSummary = summarizePerformance(
        state.performance,
        state.stats,
        state.running,
        pendingSample
      );
      updateDebugOverlay({
        stats: state.stats,
        settings: state.settings,
        probe: state.probe,
        performanceSummary: provisionalSummary,
      });
      installSnapshotHook({
        renderer: state.renderer,
        stats: state.stats,
        settings: state.settings,
        probe: state.probe,
        performanceSummary: provisionalSummary,
      });
      updateStatus(provisionalSummary);
      pendingSample.overlayMs = performance.now() - overlayStartedAt;
      recordPerformanceSample(state.performance, pendingSample);
      state.lastFrameCompletedAt = performance.now();
      updateAllOverlays();
    } finally {
      state.renderingFrame = false;
    }
  }

  async function runLoop(token) {
    while (state.running && state.loopToken === token) {
      await renderOneFrame();
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
    }
  }

  async function applySettings({ keepRunning = state.running } = {}) {
    state.loopToken += 1;
    const settings = createSettings();
    state.settings = settings;
    state.running = keepRunning;
    state.performance = createPerformanceState();
    state.stats = null;
    state.probe = null;
    state.lastFrameCompletedAt = Number.NaN;
    updateControls(settings);
    toggleLoopButton.textContent = state.running ? "Pause loop" : "Resume loop";
    mode.textContent = settings.experimentalEnabled
      ? `Feature flag: ${FEATURE_FLAG} enabled`
      : `Feature flag: ${FEATURE_FLAG} disabled`;

    if (!settings.experimentalEnabled) {
      status.textContent = "Open with ?experimental=wavefront to run the mesh BVH path.";
      return;
    }

    if (!supportsWavefrontPathTracingCompute()) {
      status.textContent = window.isSecureContext
        ? "WebGPU is unavailable in this browser."
        : "WebGPU requires localhost or HTTPS.";
      return;
    }

    state.renderer?.destroy?.();
    status.textContent = "Building GPU mesh BVH and preparing the live wavefront loop.";
    state.renderer = await renderWavefrontFrame(canvas, settings);
    await renderOneFrame({ includeProbe: true });
    if (state.running) {
      runLoop(state.loopToken).catch((error) => {
        status.textContent = error instanceof Error ? error.message : String(error);
      });
    }
  }

  renderButton.addEventListener("click", () => {
    state.running = false;
    toggleLoopButton.textContent = "Resume loop";
    renderOneFrame({ includeProbe: true }).catch((error) => {
      status.textContent = error instanceof Error ? error.message : String(error);
    });
  });
  toggleLoopButton.addEventListener("click", () => {
    state.running = !state.running;
    toggleLoopButton.textContent = state.running ? "Pause loop" : "Resume loop";
    updateAllOverlays();
    if (state.running) {
      runLoop(state.loopToken).catch((error) => {
        status.textContent = error instanceof Error ? error.message : String(error);
      });
    }
  });
  for (const id of ["maxDepthSelect", "resolutionSelect", "samplesSelect", "denoiseSelect"]) {
    document.getElementById(id).addEventListener("change", () => {
      window.history.replaceState(null, "", createUrlFromControls());
      applySettings({ keepRunning: state.running }).catch((error) => {
        status.textContent = error instanceof Error ? error.message : String(error);
      });
    });
  }
  window.addEventListener("pagehide", () => state.renderer?.destroy?.(), { once: true });
  applySettings({ keepRunning: true }).catch((error) => {
    status.textContent = error instanceof Error ? error.message : String(error);
  });
}

boot();
