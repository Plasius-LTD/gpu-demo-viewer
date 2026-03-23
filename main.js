import { demos } from "./viewer-manifest.js";

const state = {
  filter: "all",
  search: "",
  selectedId: "integration-showcase"
};

const demoListEl = document.getElementById("demoList");
const catalogSummaryEl = document.getElementById("catalogSummary");
const searchInputEl = document.getElementById("searchInput");
const filterButtons = Array.from(document.querySelectorAll(".filter"));
const runtimeBadgeEl = document.getElementById("runtimeBadge");
const runtimeDetailsEl = document.getElementById("runtimeDetails");

const selectedMetaEl = document.getElementById("selectedMeta");
const selectedTitleEl = document.getElementById("selectedTitle");
const selectedDescriptionEl = document.getElementById("selectedDescription");
const detailModeEl = document.getElementById("detailMode");
const detailRuntimeEl = document.getElementById("detailRuntime");
const detailLaunchEl = document.getElementById("detailLaunch");
const detailCommandEl = document.getElementById("detailCommand");
const detailNotesEl = document.getElementById("detailNotes");
const openDemoEl = document.getElementById("openDemo");
const openSourceEl = document.getElementById("openSource");
const openDocsEl = document.getElementById("openDocs");
const browserPaneEl = document.getElementById("browserPane");
const examplePaneEl = document.getElementById("examplePane");
const demoFrameEl = document.getElementById("demoFrame");
const previewHintEl = document.getElementById("previewHint");
const exampleFilesEl = document.getElementById("exampleFiles");

function setRuntimeStatus() {
  const onLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
  const secure = window.isSecureContext || onLocalhost;
  if (secure) {
    runtimeBadgeEl.textContent = "Secure context ready";
    runtimeBadgeEl.dataset.tone = "success";
    runtimeDetailsEl.innerHTML =
      'Browser-backed WebGPU demos can initialize here. Open this viewer from <code>localhost</code> or <code>HTTPS</code> for consistent results.';
    return;
  }

  runtimeBadgeEl.textContent = "Secure context missing";
  runtimeBadgeEl.dataset.tone = "error";
  runtimeDetailsEl.innerHTML =
    'This host is not running in a secure context. Browser-backed WebGPU demos may report <code>navigator.gpu</code> as unavailable until you serve the workspace from <code>localhost</code> or <code>HTTPS</code>.';
}

function matchesFilter(demo) {
  if (state.filter === "all") {
    return true;
  }
  if (state.filter === "browser") {
    return demo.type === "browser";
  }
  if (state.filter === "example") {
    return demo.type === "example";
  }
  if (state.filter === "3d") {
    return demo.tags.includes("3d");
  }
  if (state.filter === "integration") {
    return demo.tags.includes("integration");
  }
  return true;
}

function matchesSearch(demo) {
  const term = state.search.trim().toLowerCase();
  if (!term) {
    return true;
  }
  return [
    demo.id,
    demo.packageName,
    demo.mode,
    demo.runtime,
    demo.summary,
    ...demo.notes
  ]
    .join(" ")
    .toLowerCase()
    .includes(term);
}

function getVisibleDemos() {
  return demos.filter((demo) => matchesFilter(demo) && matchesSearch(demo));
}

function getSelectedDemo(visibleDemos) {
  if (state.selectedId) {
    const selected = visibleDemos.find((demo) => demo.id === state.selectedId);
    if (selected) {
      return selected;
    }
  }
  const hashId = window.location.hash.replace(/^#/, "");
  if (hashId) {
    const selected = visibleDemos.find((demo) => demo.id === hashId);
    if (selected) {
      return selected;
    }
  }
  return visibleDemos[0] ?? null;
}

function renderCatalog() {
  const visibleDemos = getVisibleDemos();
  const selectedDemo = getSelectedDemo(visibleDemos);
  state.selectedId = selectedDemo?.id ?? null;

  catalogSummaryEl.textContent =
    visibleDemos.length === demos.length
      ? `${visibleDemos.length} demos available`
      : `${visibleDemos.length} of ${demos.length} demos shown`;

  if (visibleDemos.length === 0) {
    demoListEl.innerHTML =
      '<div class="empty-state">No demos match the current search and filter combination.</div>';
    renderSelection(null);
    return;
  }

  demoListEl.innerHTML = "";

  for (const demo of visibleDemos) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `demo-card${demo.id === state.selectedId ? " is-selected" : ""}`;
    card.dataset.id = demo.id;
    card.innerHTML = `
      <div class="demo-card__top">
        <div>
          <p class="section-eyebrow">${demo.packageName}</p>
          <h3 class="demo-card__name">${demo.id}</h3>
        </div>
        <span class="tag tag--${demo.type}">${demo.type}</span>
      </div>
      <p class="demo-card__summary">${demo.summary}</p>
      <div class="demo-card__tags">
        ${demo.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    `;
    card.addEventListener("click", () => {
      state.selectedId = demo.id;
      window.location.hash = demo.id;
      renderCatalog();
    });
    demoListEl.appendChild(card);
  }

  renderSelection(selectedDemo);
}

function renderNotes(notes) {
  detailNotesEl.innerHTML = "";
  for (const note of notes) {
    const item = document.createElement("li");
    item.textContent = note;
    detailNotesEl.appendChild(item);
  }
}

function renderExampleFiles(demo) {
  exampleFilesEl.innerHTML = "";
  const files = [
    { label: "Primary entry", href: demo.sourcePath },
    demo.docsPath ? { label: "Package docs", href: demo.docsPath } : null
  ].filter(Boolean);

  for (const file of files) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = file.href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = `${file.label}: ${file.href.replace(/^\.\//, "")}`;
    item.appendChild(link);
    exampleFilesEl.appendChild(item);
  }
}

function renderSelection(demo) {
  if (!demo) {
    selectedMetaEl.textContent = "No demo selected";
    selectedTitleEl.textContent = "Choose a package";
    selectedDescriptionEl.textContent =
      "Adjust the filters or search term to find a demo entry.";
    detailModeEl.textContent = "-";
    detailRuntimeEl.textContent = "-";
    detailLaunchEl.textContent = "-";
    detailCommandEl.textContent = "Select a demo to see its command.";
    detailNotesEl.innerHTML = "<li>No notes available.</li>";
    browserPaneEl.hidden = true;
    examplePaneEl.hidden = true;
    openDemoEl.hidden = true;
    openSourceEl.hidden = true;
    openDocsEl.hidden = true;
    demoFrameEl.removeAttribute("src");
    return;
  }

  selectedMetaEl.textContent = demo.packageName;
  selectedTitleEl.textContent = demo.id;
  selectedDescriptionEl.textContent = demo.summary;
  detailModeEl.textContent = demo.mode;
  detailRuntimeEl.textContent = demo.runtime;
  detailLaunchEl.textContent = demo.launchPath.replace(/^\.\//, "");
  detailCommandEl.textContent = demo.command;
  renderNotes(demo.notes);

  openDemoEl.hidden = false;
  openDemoEl.textContent = demo.launchLabel;
  openDemoEl.href = demo.launchPath;
  openSourceEl.hidden = false;
  openSourceEl.href = demo.sourcePath;
  openDocsEl.hidden = !demo.docsPath;
  if (demo.docsPath) {
    openDocsEl.href = demo.docsPath;
  }

  if (demo.type === "browser") {
    browserPaneEl.hidden = false;
    examplePaneEl.hidden = true;
    previewHintEl.textContent = demo.tags.includes("integration")
      ? "Integrated cross-package harbor preview. Use this to validate the full family together."
      : "Mounted 3D preview. Interact with the embedded demo directly.";
    demoFrameEl.src = demo.launchPath;
  } else {
    browserPaneEl.hidden = true;
    examplePaneEl.hidden = false;
    demoFrameEl.removeAttribute("src");
    renderExampleFiles(demo);
  }
}

function bindEvents() {
  searchInputEl.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderCatalog();
  });

  for (const button of filterButtons) {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter ?? "all";
      for (const sibling of filterButtons) {
        sibling.classList.toggle("is-active", sibling === button);
      }
      renderCatalog();
    });
  }

  window.addEventListener("hashchange", () => {
    state.selectedId = window.location.hash.replace(/^#/, "") || null;
    renderCatalog();
  });
}

setRuntimeStatus();
bindEvents();
renderCatalog();
