// DOM rendering. The rail is built once, then updated with targeted class
// toggles + text updates (not full rebuilds) so the module "zoom open" CSS
// transition in styles.css only ever plays on the module actually clicked.
// Rituals work the same way. Continue Watching is the exception: its list
// membership changes as items are opened/completed, so that one section is
// rebuilt on change — it has no mount animation, so that's cheap and safe.

import { modules, rituals } from "../data/curriculum.js";
import {
  isWatched,
  toggleWatched,
  markOpened,
  getModuleProgress,
  isModuleCollapsed,
  toggleModuleCollapsed,
  isRitualCompleteToday,
  toggleRitualToday,
  getContinueWatching,
} from "./state.js";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (children != null) {
    for (const child of Array.isArray(children) ? children : [children]) {
      if (child == null) continue;
      node.append(typeof child === "string" ? document.createTextNode(child) : child);
    }
  }
  return node;
}

function progressLabel(module) {
  const { watchedCount, total } = getModuleProgress(module);
  return `${watchedCount}/${total}`;
}

// ---------- Left rail ----------

function buildModuleNode(module) {
  const collapsed = isModuleCollapsed(module.id);

  const li = el("li", "module" + (collapsed ? " is-collapsed" : ""));
  li.dataset.moduleId = module.id;

  const header = el("button", "module-header");
  header.type = "button";
  header.setAttribute("aria-expanded", String(!collapsed));
  header.append(
    el("span", "module-chevron", "▾"),
    el("span", "module-title", module.title),
    el("span", "module-progress", progressLabel(module))
  );

  const list = el(
    "ul",
    "submodule-list",
    module.submodules.map((sub) => {
      const row = el("li", "submodule-row");
      row.dataset.submoduleId = sub.id;

      const ring = el("button", "watch-ring" + (isWatched(sub.id) ? " is-watched" : ""));
      ring.type = "button";
      ring.dataset.action = "toggle-watch";
      ring.setAttribute("aria-label", "Toggle watched");

      const title = el("button", "submodule-title", sub.title);
      title.type = "button";
      title.dataset.action = "open";

      row.append(ring, title);
      return row;
    })
  );

  const panel = el("div", "module-panel", list);
  li.append(header, panel);
  return li;
}

function buildRail() {
  const rail = document.getElementById("rail-modules");
  rail.replaceChildren(...modules.map(buildModuleNode));
}

// Reflects one submodule's watched state + its module's progress count
// without touching any other DOM node.
function syncSubmodule(submoduleId) {
  const row = document.querySelector(`.submodule-row[data-submodule-id="${submoduleId}"]`);
  if (!row) return;
  row.querySelector(".watch-ring").classList.toggle("is-watched", isWatched(submoduleId));

  const moduleNode = row.closest(".module");
  const module = modules.find((m) => m.id === moduleNode.dataset.moduleId);
  moduleNode.querySelector(".module-progress").textContent = progressLabel(module);
}

function handleRailClick(e) {
  const ringBtn = e.target.closest('[data-action="toggle-watch"]');
  if (ringBtn) {
    const submoduleId = ringBtn.closest(".submodule-row").dataset.submoduleId;
    toggleWatched(submoduleId);
    syncSubmodule(submoduleId);
    return;
  }

  const openBtn = e.target.closest('[data-action="open"]');
  if (openBtn) {
    const submoduleId = openBtn.closest(".submodule-row").dataset.submoduleId;
    markOpened(submoduleId);
    renderContinueWatching();
    return;
  }

  const header = e.target.closest(".module-header");
  if (header) {
    const moduleNode = header.closest(".module");
    toggleModuleCollapsed(moduleNode.dataset.moduleId);
    const collapsed = isModuleCollapsed(moduleNode.dataset.moduleId);
    moduleNode.classList.toggle("is-collapsed", collapsed);
    header.setAttribute("aria-expanded", String(!collapsed));
  }
}

// ---------- Daily Rituals ----------

function buildRitualCard(ritual) {
  const done = isRitualCompleteToday(ritual.id);
  const card = el("div", "ritual-card" + (done ? " is-complete" : ""));
  card.dataset.ritualId = ritual.id;

  const ring = el("span", "watch-ring" + (done ? " is-watched" : ""));
  const body = el("div", "ritual-body", [
    el("span", "ritual-period", ritual.period),
    el("h3", "ritual-title", ritual.title),
    el("p", "ritual-subtitle", ritual.subtitle || ""),
  ]);

  card.append(ring, body);
  return card;
}

function buildRituals() {
  const wrap = document.getElementById("rituals-list");
  wrap.replaceChildren(...rituals.map(buildRitualCard));
}

function handleRitualsClick(e) {
  const card = e.target.closest(".ritual-card");
  if (!card) return;
  const ritualId = card.dataset.ritualId;
  toggleRitualToday(ritualId);
  const done = isRitualCompleteToday(ritualId);
  card.classList.toggle("is-complete", done);
  card.querySelector(".watch-ring").classList.toggle("is-watched", done);
}

// ---------- Continue Watching ----------

function buildContinueCard({ module, submodule }) {
  const card = el("div", "continue-card");
  card.dataset.submoduleId = submodule.id;

  const thumb = el("div", "continue-thumb");
  const body = el("div", "continue-body", [
    el("span", "continue-breadcrumb", module.title),
    el("h3", "continue-title", submodule.title),
  ]);
  const resume = el("button", "continue-resume", "Resume");
  resume.type = "button";

  card.append(thumb, body, resume);
  return card;
}

function renderContinueWatching() {
  const wrap = document.getElementById("continue-watching-list");
  const items = getContinueWatching(modules);

  if (items.length === 0) {
    wrap.replaceChildren(
      el("p", "empty-state", "Nothing in progress yet — open a lesson from the curriculum to start.")
    );
    return;
  }

  wrap.replaceChildren(...items.map(buildContinueCard));
}

function handleContinueClick(e) {
  const btn = e.target.closest(".continue-resume");
  if (!btn) return;
  const submoduleId = btn.closest(".continue-card").dataset.submoduleId;
  toggleWatched(submoduleId);
  syncSubmodule(submoduleId);
  renderContinueWatching();
}

// ---------- Entry point ----------

export function init() {
  buildRail();
  buildRituals();
  renderContinueWatching();

  document.getElementById("rail-modules").addEventListener("click", handleRailClick);
  document.getElementById("rituals-list").addEventListener("click", handleRitualsClick);
  document.getElementById("continue-watching-list").addEventListener("click", handleContinueClick);
}
