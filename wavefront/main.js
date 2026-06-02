import { createWavefrontPathTracingPlan } from "@plasius/gpu-renderer";

const FEATURE_FLAG = "gpu.wavefrontPathTracingDemo";
const EPSILON = 0.001;
const FAR = 1e6;

const materials = Object.freeze({
  clay: Object.freeze({
    id: 1,
    label: "diffuse clay",
    color: [0.74, 0.42, 0.28],
    kind: "diffuse",
  }),
  metal: Object.freeze({
    id: 2,
    label: "reflective metal",
    color: [0.92, 0.86, 0.72],
    kind: "reflective",
    roughness: 0.03,
  }),
  glass: Object.freeze({
    id: 3,
    label: "refractive glass",
    color: [0.74, 0.9, 1.0],
    kind: "refractive",
    ior: 1.45,
  }),
  water: Object.freeze({
    id: 4,
    label: "fluid water",
    color: [0.45, 0.78, 0.92],
    kind: "water",
    ior: 1.33,
  }),
  light: Object.freeze({
    id: 5,
    label: "emissive geometry",
    color: [1, 0.78, 0.43],
    kind: "emissive",
    emission: [9.5, 6.4, 3.1],
  }),
  absorber: Object.freeze({
    id: 6,
    label: "no-light absorber",
    color: [0.02, 0.018, 0.015],
    kind: "absorber",
  }),
});

const sceneObjects = Object.freeze([
  Object.freeze({
    id: 101,
    type: "sphere",
    label: "smooth diffuse sphere",
    center: [-0.95, -0.08, -1.0],
    radius: 0.68,
    material: materials.clay,
    smoothNormals: true,
  }),
  Object.freeze({
    id: 102,
    type: "sphere",
    label: "mirror sphere",
    center: [0.68, -0.2, -1.35],
    radius: 0.48,
    material: materials.metal,
    smoothNormals: true,
  }),
  Object.freeze({
    id: 103,
    type: "sphere",
    label: "glass sphere",
    center: [0.08, -0.28, -0.25],
    radius: 0.34,
    material: materials.glass,
    smoothNormals: true,
  }),
  Object.freeze({
    id: 104,
    type: "sphere",
    label: "emissive sphere",
    center: [0.25, 1.3, -1.7],
    radius: 0.32,
    material: materials.light,
    smoothNormals: true,
  }),
  Object.freeze({
    id: 105,
    type: "sphere",
    label: "dark no-light target",
    center: [-1.72, -0.12, -0.42],
    radius: 0.22,
    material: materials.absorber,
    smoothNormals: true,
  }),
  Object.freeze({
    id: 201,
    type: "plane",
    label: "fluid water surface",
    point: [0, -0.58, 0],
    normal: [0, 1, 0],
    bounds: Object.freeze({ x: [-2.5, 2.5], z: [-3.2, 0.9] }),
    material: materials.water,
  }),
  Object.freeze({
    id: 202,
    type: "plane",
    label: "matte back wall",
    point: [0, -0.64, -2.55],
    normal: [0, 0.12, 1],
    bounds: Object.freeze({ x: [-2.8, 2.8], y: [-0.65, 2.2] }),
    material: materials.clay,
  }),
]);

const resolutionModes = Object.freeze({
  capture: Object.freeze({ width: 144, height: 90, samples: 1 }),
  balanced: Object.freeze({ width: 192, height: 120, samples: 1 }),
  detail: Object.freeze({ width: 256, height: 160, samples: 2 }),
});

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function multiply(a, b) {
  return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
}

function scale(vector, amount) {
  return [vector[0] * amount, vector[1] * amount, vector[2] * amount];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function length(vector) {
  return Math.sqrt(dot(vector, vector));
}

function normalize(vector) {
  const size = length(vector);
  if (size <= Number.EPSILON) {
    return [0, 1, 0];
  }
  return scale(vector, 1 / size);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mix(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function reflect(direction, normal) {
  return normalize(subtract(direction, scale(normal, 2 * dot(direction, normal))));
}

function refract(direction, normal, etaRatio) {
  const cosTheta = Math.min(dot(scale(direction, -1), normal), 1);
  const perpendicular = scale(add(direction, scale(normal, cosTheta)), etaRatio);
  const k = 1 - dot(perpendicular, perpendicular);
  if (k < 0) {
    return null;
  }
  return normalize(add(perpendicular, scale(normal, -Math.sqrt(k))));
}

function hash(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return value - Math.floor(value);
}

function createCamera() {
  const origin = [0, 0.45, 2.85];
  const target = [-0.08, -0.1, -1.12];
  const forward = normalize(subtract(target, origin));
  const right = normalize(cross(forward, [0, 1, 0]));
  const up = normalize(cross(right, forward));
  return Object.freeze({
    origin,
    forward,
    right,
    up,
    fovRadians: (47 * Math.PI) / 180,
  });
}

function createPrimaryRay(pixelX, pixelY, sample, settings, camera) {
  const jitterX = settings.samples === 1 ? 0.5 : 0.28 + 0.44 * hash(sample + pixelX * 17);
  const jitterY = settings.samples === 1 ? 0.5 : 0.28 + 0.44 * hash(sample + pixelY * 29);
  const aspect = settings.width / settings.height;
  const viewScale = Math.tan(camera.fovRadians / 2);
  const ndcX = ((pixelX + jitterX) / settings.width) * 2 - 1;
  const ndcY = 1 - ((pixelY + jitterY) / settings.height) * 2;
  const direction = normalize(
    add(
      camera.forward,
      add(scale(camera.right, ndcX * aspect * viewScale), scale(camera.up, ndcY * viewScale))
    )
  );
  const sourcePixelId = pixelY * settings.width + pixelX;

  return {
    rayId: sourcePixelId * settings.samples + sample,
    parentRayId: 0,
    sourcePixelId,
    sampleId: sample,
    bounce: 0,
    origin: camera.origin,
    direction,
    throughput: [1, 1, 1],
    mediumRefId: 0,
    flags: 0,
  };
}

function intersectSphere(ray, object) {
  const oc = subtract(ray.origin, object.center);
  const a = dot(ray.direction, ray.direction);
  const halfB = dot(oc, ray.direction);
  const c = dot(oc, oc) - object.radius * object.radius;
  const discriminant = halfB * halfB - a * c;
  if (discriminant < 0) {
    return null;
  }

  const root = Math.sqrt(discriminant);
  const first = (-halfB - root) / a;
  const second = (-halfB + root) / a;
  const distance = first > EPSILON ? first : second > EPSILON ? second : null;
  if (distance == null) {
    return null;
  }

  const position = add(ray.origin, scale(ray.direction, distance));
  const geometricNormal = normalize(subtract(position, object.center));
  const frontFace = dot(ray.direction, geometricNormal) < 0;
  const shadingNormal = frontFace ? geometricNormal : scale(geometricNormal, -1);
  const u = 0.5 + Math.atan2(geometricNormal[2], geometricNormal[0]) / (2 * Math.PI);
  const v = 0.5 - Math.asin(geometricNormal[1]) / Math.PI;

  return {
    hit: true,
    hitType: object.material.kind === "emissive" ? "emissive" : "surface",
    distance,
    position,
    object,
    entityId: object.id,
    primitiveId: object.id,
    materialId: object.material.id,
    uv: [u, v],
    barycentrics: [1 - u, u * (1 - v), v],
    geometricNormal,
    shadingNormal,
    frontFace,
  };
}

function planeAxisValue(position, axis) {
  return axis === "x" ? position[0] : axis === "y" ? position[1] : position[2];
}

function isWithinPlaneBounds(position, bounds) {
  return Object.entries(bounds).every(([axis, range]) => {
    const value = planeAxisValue(position, axis);
    return value >= range[0] && value <= range[1];
  });
}

function intersectPlane(ray, object) {
  const normal = normalize(object.normal);
  const denominator = dot(normal, ray.direction);
  if (Math.abs(denominator) < EPSILON) {
    return null;
  }

  const distance = dot(subtract(object.point, ray.origin), normal) / denominator;
  if (distance <= EPSILON) {
    return null;
  }

  const position = add(ray.origin, scale(ray.direction, distance));
  if (object.bounds && !isWithinPlaneBounds(position, object.bounds)) {
    return null;
  }

  const frontFace = dot(ray.direction, normal) < 0;
  const geometricNormal = frontFace ? normal : scale(normal, -1);
  const uv = [position[0] * 0.5 + 0.5, position[2] * 0.5 + 0.5];

  return {
    hit: true,
    hitType: "surface",
    distance,
    position,
    object,
    entityId: object.id,
    primitiveId: object.id,
    materialId: object.material.id,
    uv,
    barycentrics: [1 - uv[0], uv[0] * (1 - uv[1]), uv[1]],
    geometricNormal,
    shadingNormal: geometricNormal,
    frontFace,
  };
}

function intersectScene(ray) {
  let nearest = null;
  for (const object of sceneObjects) {
    const hit =
      object.type === "sphere" ? intersectSphere(ray, object) : intersectPlane(ray, object);
    if (hit && (!nearest || hit.distance < nearest.distance)) {
      nearest = hit;
    }
  }

  if (!nearest) {
    return {
      hit: false,
      hitType: "environment",
      distance: FAR,
      entityId: 0,
      primitiveId: 0,
      materialId: 0,
    };
  }

  return nearest;
}

function sampleEnvironment(direction) {
  const horizon = [0.08, 0.18, 0.24];
  const zenith = [0.38, 0.56, 0.72];
  const night = [0.018, 0.022, 0.04];
  const t = clamp(direction[1] * 0.5 + 0.5, 0, 1);
  const base = mix(night, mix(horizon, zenith, t), 0.84);
  const lightDirection = normalize([0.26, 0.82, -0.52]);
  const glint = Math.pow(clamp(dot(direction, lightDirection), 0, 1), 180);
  return add(base, scale([1.0, 0.72, 0.34], glint * 8));
}

function hemisphereDirection(normal, seed) {
  const u = hash(seed + 3.17);
  const v = hash(seed + 9.91);
  const phi = 2 * Math.PI * u;
  const cosTheta = Math.sqrt(1 - v);
  const sinTheta = Math.sqrt(v);
  const tangent = Math.abs(normal[1]) < 0.92 ? normalize(cross([0, 1, 0], normal)) : [1, 0, 0];
  const bitangent = cross(normal, tangent);
  return normalize(
    add(
      add(scale(tangent, Math.cos(phi) * sinTheta), scale(bitangent, Math.sin(phi) * sinTheta)),
      scale(normal, cosTheta)
    )
  );
}

function offsetOrigin(position, normal) {
  return add(position, scale(normal, EPSILON * 8));
}

function evaluateSurface(ray, hit, nextRayId) {
  const material = hit.object.material;
  if (material.kind === "emissive") {
    return {
      terminal: true,
      reason: "emissive",
      radiance: material.emission,
    };
  }

  if (material.kind === "absorber") {
    return {
      terminal: true,
      reason: "noLight",
      radiance: [0, 0, 0],
    };
  }

  const seed = ray.sourcePixelId * 97 + ray.sampleId * 13 + ray.bounce * 31;
  let direction;
  let throughput = multiply(ray.throughput, material.color);
  let mediumRefId = ray.mediumRefId;
  let flags = ray.flags;

  if (material.kind === "reflective") {
    direction = reflect(ray.direction, hit.shadingNormal);
    throughput = scale(throughput, 0.92);
    flags |= 1;
  } else if (material.kind === "refractive") {
    const etaRatio = hit.frontFace ? 1 / material.ior : material.ior;
    direction = refract(ray.direction, hit.shadingNormal, etaRatio);
    if (!direction) {
      direction = reflect(ray.direction, hit.shadingNormal);
      throughput = scale(throughput, 0.82);
      flags |= 1;
    } else {
      throughput = scale(throughput, 0.9);
      mediumRefId = hit.frontFace ? material.id : 0;
      flags |= 2;
    }
  } else if (material.kind === "water") {
    const reflection = reflect(ray.direction, hit.shadingNormal);
    const etaRatio = hit.frontFace ? 1 / material.ior : material.ior;
    const transmission = refract(ray.direction, hit.shadingNormal, etaRatio);
    direction = hash(seed) > 0.38 && transmission ? transmission : reflection;
    throughput = scale(throughput, 0.72);
    mediumRefId = material.id;
    flags |= 4;
  } else {
    direction = hemisphereDirection(hit.shadingNormal, seed);
    const lift = clamp(dot(direction, hit.shadingNormal), 0.18, 1);
    throughput = scale(throughput, lift * 0.84);
  }

  return {
    terminal: false,
    nextRay: {
      rayId: nextRayId,
      parentRayId: ray.rayId,
      sourcePixelId: ray.sourcePixelId,
      sampleId: ray.sampleId,
      bounce: ray.bounce + 1,
      origin: offsetOrigin(hit.position, hit.shadingNormal),
      direction,
      throughput,
      mediumRefId,
      flags,
    },
  };
}

function createStats(plan, settings) {
  return {
    plan,
    settings,
    renderMs: 0,
    queueOverflow: 0,
    bounces: [],
    termination: {
      emissive: 0,
      environment: 0,
      noLight: 0,
      maxDepth: 0,
    },
    hitTypes: {
      surface: 0,
      emissive: 0,
      environment: 0,
      transparent: 0,
      miss: 0,
    },
  };
}

function addRadiance(accumulation, sourcePixelId, throughput, radiance) {
  const offset = sourcePixelId * 3;
  const contribution = multiply(throughput, radiance);
  accumulation[offset] += contribution[0];
  accumulation[offset + 1] += contribution[1];
  accumulation[offset + 2] += contribution[2];
}

function processWavefrontBounces(primaryRays, accumulation, plan, settings) {
  const stats = createStats(plan, settings);
  let activeQueue = primaryRays;
  let nextRayId = primaryRays.length + 1;
  const startedAt = performance.now();

  for (let bounce = 0; bounce < plan.maxDepth && activeQueue.length > 0; bounce += 1) {
    const hits = activeQueue.map((ray) => intersectScene(ray));
    const nextQueue = [];
    const bounceStats = {
      bounce,
      active: activeQueue.length,
      surfaceHits: 0,
      emissiveHits: 0,
      environmentHits: 0,
      spawned: 0,
    };

    for (let index = 0; index < activeQueue.length; index += 1) {
      const ray = activeQueue[index];
      const hit = hits[index];
      stats.hitTypes[hit.hitType] = (stats.hitTypes[hit.hitType] ?? 0) + 1;

      if (!hit.hit) {
        stats.termination.environment += 1;
        bounceStats.environmentHits += 1;
        addRadiance(accumulation, ray.sourcePixelId, ray.throughput, sampleEnvironment(ray.direction));
        continue;
      }

      if (hit.hitType === "emissive") {
        stats.termination.emissive += 1;
        bounceStats.emissiveHits += 1;
      } else {
        bounceStats.surfaceHits += 1;
      }

      const event = evaluateSurface(ray, hit, nextRayId);
      if (event.terminal) {
        stats.termination[event.reason] += event.reason === "emissive" ? 0 : 1;
        addRadiance(accumulation, ray.sourcePixelId, ray.throughput, event.radiance);
        continue;
      }

      if (nextQueue.length >= plan.queueCapacity) {
        stats.queueOverflow += 1;
        continue;
      }

      nextRayId += 1;
      nextQueue.push(event.nextRay);
      bounceStats.spawned += 1;
    }

    stats.bounces.push(bounceStats);
    activeQueue = nextQueue;
  }

  if (activeQueue.length > 0) {
    stats.termination.maxDepth += activeQueue.length;
  }

  stats.renderMs = performance.now() - startedAt;
  return stats;
}

function toneMap(value) {
  const mapped = value / (1 + value);
  return Math.pow(clamp(mapped, 0, 1), 1 / 2.2);
}

function writeImageData(canvas, accumulation, settings) {
  canvas.width = settings.width;
  canvas.height = settings.height;
  const context = canvas.getContext("2d");
  const image = context.createImageData(settings.width, settings.height);
  const invSamples = 1 / settings.samples;

  for (let pixel = 0; pixel < settings.width * settings.height; pixel += 1) {
    const src = pixel * 3;
    const dst = pixel * 4;
    image.data[dst] = Math.round(toneMap(accumulation[src] * invSamples) * 255);
    image.data[dst + 1] = Math.round(toneMap(accumulation[src + 1] * invSamples) * 255);
    image.data[dst + 2] = Math.round(toneMap(accumulation[src + 2] * invSamples) * 255);
    image.data[dst + 3] = 255;
  }

  context.putImageData(image, 0, 0);
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
  const resolution = resolutionModes[resolutionKey];
  const requestedDepth = Number(params.get("maxDepth"));
  const maxDepth = Number.isInteger(requestedDepth)
    ? clamp(requestedDepth, 3, 8)
    : capture
      ? 6
      : 5;
  const experimentalEnabled =
    params.get("experimental") === "wavefront" ||
    params.get("quality") === "experimental" ||
    params.get("feature") === FEATURE_FLAG;

  return {
    ...resolution,
    resolutionKey,
    maxDepth,
    capture,
    experimentalEnabled,
  };
}

function createPrimaryQueue(settings) {
  const camera = createCamera();
  const rays = [];
  for (let y = 0; y < settings.height; y += 1) {
    for (let x = 0; x < settings.width; x += 1) {
      for (let sample = 0; sample < settings.samples; sample += 1) {
        rays.push(createPrimaryRay(x, y, sample, settings, camera));
      }
    }
  }
  return rays;
}

function renderWavefrontFrame(canvas, settings) {
  const queueCapacity = settings.width * settings.height * settings.samples * 2;
  const plan = createWavefrontPathTracingPlan({
    maxDepth: settings.maxDepth,
    queueCapacity,
    explicitLightSampling: false,
    accumulationResetEpoch: settings.capture ? 1 : 0,
  });
  const primaryRays = createPrimaryQueue(settings);
  const accumulation = new Float32Array(settings.width * settings.height * 3);
  const stats = processWavefrontBounces(primaryRays, accumulation, plan, settings);
  writeImageData(canvas, accumulation, settings);
  return stats;
}

function renderMetricList(root, metrics) {
  root.innerHTML = metrics
    .map(
      ([label, value]) => `
        <div>
          <dt>${label}</dt>
          <dd>${value}</dd>
        </div>
      `
    )
    .join("");
}

function renderBounceRows(root, stats) {
  const peak = Math.max(...stats.bounces.map((entry) => entry.active), 1);
  root.innerHTML = stats.bounces
    .map((entry) => {
      const width = Math.max(3, Math.round((entry.active / peak) * 100));
      return `
        <div class="bounce-row">
          <div class="bounce-row__top">
            <strong>Bounce ${entry.bounce}</strong>
            <span>${entry.active} active</span>
          </div>
          <div class="bounce-meter"><span style="width: ${width}%"></span></div>
          <div class="bounce-row__meta">
            <span>${entry.surfaceHits} surfaces</span>
            <span>${entry.emissiveHits} light hits</span>
            <span>${entry.environmentHits} skybox</span>
            <span>${entry.spawned} next</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function updateDebugOverlay(stats) {
  renderMetricList(document.getElementById("terminationStats"), [
    ["emissive", stats.termination.emissive],
    ["skybox", stats.termination.environment],
    ["no light", stats.termination.noLight],
    ["max depth", stats.termination.maxDepth],
  ]);
  renderMetricList(document.getElementById("contractStats"), [
    ["max depth", stats.plan.maxDepth],
    ["queue", stats.plan.queueLayout.strategy],
    ["passes", stats.plan.bounceSchedule[0].passOrder.length],
    ["render", `${stats.renderMs.toFixed(1)} ms`],
    ["samples", stats.settings.samples],
    ["resolution", `${stats.settings.width}x${stats.settings.height}`],
  ]);
  renderBounceRows(document.getElementById("bounceRows"), stats);
}

function updateControls(settings) {
  document.getElementById("maxDepthSelect").value = String(settings.maxDepth);
  document.getElementById("resolutionSelect").value = settings.resolutionKey;
  document.getElementById(
    "captureLink"
  ).href = `./?experimental=wavefront&capture=1&maxDepth=${settings.maxDepth}`;
}

function createUrlFromControls() {
  const maxDepth = document.getElementById("maxDepthSelect").value;
  const resolution = document.getElementById("resolutionSelect").value;
  return `./?experimental=wavefront&resolution=${resolution}&maxDepth=${maxDepth}`;
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
    if (!settings.experimentalEnabled) {
      status.textContent = "Open with ?experimental=wavefront to run the experimental path.";
      return;
    }

    status.textContent = "Running primary rays, intersection, surface evaluation, and bounce queues.";
    requestAnimationFrame(() => {
      const stats = renderWavefrontFrame(canvas, settings);
      updateDebugOverlay(stats);
      status.textContent = `Rendered ${settings.width * settings.height * settings.samples} primary rays breadth-first. Direct light probes are disabled; light arrives only from emissive or skybox hits.`;
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

  render();
}

boot();
