// All mutable app state + localStorage persistence lives here.
// Nothing in this file knows how to render — render.js reads these
// functions' return values and rebuilds the DOM.

const STORAGE_KEY = "curriculum-ui:v1";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveRaw(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — state just
    // won't persist across reloads. Not fatal to the app.
  }
}

const raw = loadRaw() || {};

const state = {
  // { [submoduleId]: true } — presence = watched
  watched: raw.watched || {},
  // { [submoduleId]: isoTimestamp } — last time a submodule was opened;
  // drives "Continue Watching"
  lastOpened: raw.lastOpened || {},
  // { [dateKey]: { [ritualId]: true } } — resets naturally each day since
  // it's keyed by calendar date
  ritualCompletion: raw.ritualCompletion || {},
  // { [moduleId]: true } — collapsed modules in the left rail
  collapsed: raw.collapsed || {},
};

function persist() {
  saveRaw(state);
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
