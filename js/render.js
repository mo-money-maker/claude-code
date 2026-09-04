// DOM rendering. Rebuilds the left rail and main panel from current data +
// state on every call. The tree here is small enough that a full re-render
// per interaction is simpler (and plenty fast) than diffing by hand.

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

function watchRing(watched) {
  const ring = el("button", "watch-ring" + (watched ? " is-watched" : ""));
  ring.type = "button";
  ring.setAttribute("aria-label", watched ? "Mark as unwatched" : "Mark as watched");
  ring.setAttribute("aria-pressed", String(watched));
  return ring;
}

function renderSubmodule(module, submodule, onChange) {
  const watched = isWatched(submodule.id);
  const row = el("li", "submodule-row");

  const ring = watchRing(watched);
  ring.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleWatched(submodule.id);
    onChange();
  });

  const title = el("button", "submodule-title", submodule.title);
  title.type = "button";
  title.addEventListener("click", () => {
    markOpened(submodule.id);
    onChange();
  });

  row.append(ring, title);
  return row;
}

function renderModule(module, onChange) {
  const { watchedCount, total } = getModuleProgress(module);
  const collapsed = isModuleCollapsed(module.id);

  const wrap = el("li", "module" + (collapsed ? " is-collapsed" : ""));

  const header = el("button", "module-header");
  header.type = "button";
  header.setAttribute("aria-expanded", String(!collapsed));

  const chevron = el("span", "module-chevron", "▾");
  const title = el("span", "module-title", module.title);
  const progress = el("span", "module-progress", `${watchedCount}/${total}`);

  header.append(chevron, title, progress);
  header.addEventListener("click", () => {
    toggleModuleCollapsed(module.id);
    onChange();
  });

  const list = el(
    "ul",
    "submodule-list",
    module.submodules.map((s) => renderSubmodule(module, s, onChange))
  );

  wrap.append(header, list);
  return wrap;
}

function renderRail(onChange) {
  const rail = document.getElementById("rail-modules");
  rail.replaceChildren(...modules.map((m) => renderModule(m, onChange)));
}

function renderRitualCard(ritual, onChange) {
  const done = isRitualCompleteToday(ritual.id);
  const card = el("div", "ritual-card" + (done ? " is-complete" : ""));

  const ring = watchRing(done);
  ring.setAttribute("aria-label", done ? "Mark ritual as not done today" : "Mark ritual done today");

  const body = el("div", "ritual-body", [
    el("span", "ritual-period", ritual.period),
    el("h3", "ritual-title", ritual.title),
    el("p", "ritual-subtitle", ritual.subtitle || ""),
  ]);

  card.append(ring, body);
  card.addEventListener("click", () => {
    toggleRitualToday(ritual.id);
    onChange();
  });

  return card;
}

function renderRituals(onChange) {
  const wrap = document.getElementById("rituals-list");
  wrap.replaceChildren(...rituals.map((r) => renderRitualCard(r, onChange)));
}

function renderContinueWatching(onChange) {
  const wrap = document.getElementById("continue-watching-list");
  const items = getContinueWatching(modules);

  if (items.length === 0) {
    wrap.replaceChildren(
      el("p", "empty-state", "Nothing in progress yet — open a lesson from the curriculum to start.")
    );
    return;
  }

  wrap.replaceChildren(
    ...items.map(({ module, submodule }) => {
      const card = el("div", "continue-card");
      const thumb = el("div", "continue-thumb");
      const body = el("div", "continue-body", [
        el("span", "continue-breadcrumb", module.title),
        el("h3", "continue-title", submodule.title),
      ]);
      const resume = el("button", "continue-resume", "Resume");
      resume.type = "button";
      resume.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleWatched(submodule.id);
        onChange();
      });
      card.append(thumb, body, resume);
      return card;
    })
  );
}

export function render() {
  const onChange = render;
  renderRail(onChange);
  renderRituals(onChange);
  renderContinueWatching(onChange);
}
