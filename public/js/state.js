// Mutable app state. Reads/writes are synchronous against an in-memory
// object (so UI updates and their CSS animations stay instant), backed by
// the server: initState() loads the signed-in user's state once at boot,
// and every mutator fires an async, fire-and-forget save after updating
// the local copy.

import * as api from "./api.js";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

let state = { watched: {}, lastOpened: {}, ritualCompletion: {}, collapsed: {} };
let ready = false;

export async function initState() {
  const remote = await api.getState();
  state = {
    watched: remote.watched || {},
    lastOpened: remote.lastOpened || {},
    ritualCompletion: remote.ritualCompletion || {},
    collapsed: remote.collapsed || {},
  };
  ready = true;
}

function persist() {
  if (!ready) return;
  api.saveState(state).catch((err) => {
    console.error("Failed to save progress:", err.message);
  });
}

export function isWatched(submoduleId) {
  return !!state.watched[submoduleId];
}

export function toggleWatched(submoduleId) {
  if (state.watched[submoduleId]) {
    delete state.watched[submoduleId];
  } else {
    state.watched[submoduleId] = true;
  }
  persist();
}

export function markOpened(submoduleId) {
  state.lastOpened[submoduleId] = new Date().toISOString();
  persist();
}

export function getModuleProgress(module) {
  const total = module.submodules.length;
  const watchedCount = module.submodules.filter((s) => isWatched(s.id)).length;
  return { watchedCount, total };
}

export function isModuleCollapsed(moduleId) {
  return !!state.collapsed[moduleId];
}

export function toggleModuleCollapsed(moduleId) {
  if (state.collapsed[moduleId]) {
    delete state.collapsed[moduleId];
  } else {
    state.collapsed[moduleId] = true;
  }
  persist();
}

export function isRitualCompleteToday(ritualId) {
  const today = state.ritualCompletion[todayKey()];
  return !!(today && today[ritualId]);
}

export function toggleRitualToday(ritualId) {
  const key = todayKey();
  if (!state.ritualCompletion[key]) state.ritualCompletion[key] = {};
  if (state.ritualCompletion[key][ritualId]) {
    delete state.ritualCompletion[key][ritualId];
  } else {
    state.ritualCompletion[key][ritualId] = true;
  }
  persist();
}

// Submodules opened but not yet fully watched, most-recent first.
export function getContinueWatching(modules, limit = 4) {
  const items = [];
  for (const module of modules) {
    for (const sub of module.submodules) {
      const openedAt = state.lastOpened[sub.id];
      if (openedAt && !isWatched(sub.id)) {
        items.push({ module, submodule: sub, openedAt });
      }
    }
  }
  items.sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt));
  return items.slice(0, limit);
}
