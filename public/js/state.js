// Mutable app state. Reads are synchronous against an in-memory object so
// the UI stays instant; writes are debounced and pushed to the server.
//
// Completion is autonomous: nothing here is toggled by hand. The player
// reports playback position, and an item completes itself once it passes
// COMPLETE_AT.

import * as api from "./api.js";

// Standard LMS practice is to complete somewhere short of the very end, so
// trailing credits/silence don't strand a lesson at 99%.
export const COMPLETE_AT = 0.9;

const SAVE_DEBOUNCE_MS = 1500;

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// Monday as the start of the week.
function startOfWeek(d = new Date()) {
  const day = new Date(d);
  const offset = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - offset);
  day.setHours(0, 0, 0, 0);
  return day;
}

export const WEEKLY_GOAL_OPTIONS = [3, 5, 7, 10];

let state = { watched: {}, progress: {}, ritualCompletion: {}, activity: {}, weeklyGoal: 3 };
let ready = false;
let saveTimer = null;

export async function initState() {
  const remote = await api.getState();
  state = {
    watched: remote.watched || {},
    progress: remote.progress || {},
    ritualCompletion: remote.ritualCompletion || {},
    activity: remote.activity || {},
    weeklyGoal: remote.weeklyGoal || 3,
  };
  ready = true;
}

function save() {
  if (!ready) return;
  api.saveState(state).catch((err) => console.error("Failed to save progress:", err.message));
}

function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(save, SAVE_DEBOUNCE_MS);
}

// `beacon` is for page unload: a normal fetch gets cancelled as the page
// goes away, so partial playback position would be lost. sendBeacon is
// queued by the browser and delivered regardless.
export function flush({ beacon = false } = {}) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
  if (!ready) return;

  if (beacon && navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
    if (navigator.sendBeacon("/api/state", blob)) return;
  }
  save();
}

// ---------- Playback-driven completion ----------

export function getProgress(id) {
  return state.progress[id] || 0;
}

export function setProgress(id, fraction) {
  const next = Math.max(getProgress(id), Math.min(fraction, 1));
  state.progress[id] = next;
  persist();
}

function recordActivity(kind) {
  const key = todayKey();
  const day = state.activity[key] || { lessons: 0, rituals: 0 };
  day[kind] += 1;
  state.activity[key] = day;
}

// Called by the player once an item crosses the completion threshold.
// Returns true the first time an item completes, so the UI can celebrate.
export function completeItem(id, { ritual = false } = {}) {
  const already = ritual ? isRitualCompleteToday(id) : isWatched(id);
  state.progress[id] = 1;

  if (ritual) {
    const key = todayKey();
    if (!state.ritualCompletion[key]) state.ritualCompletion[key] = {};
    state.ritualCompletion[key][id] = true;
  } else {
    state.watched[id] = true;
  }

  if (!already) recordActivity(ritual ? "rituals" : "lessons");
  flush();
  return !already;
}

export function isWatched(submoduleId) {
  return !!state.watched[submoduleId];
}

export function isRitualCompleteToday(ritualId) {
  const today = state.ritualCompletion[todayKey()];
  return !!(today && today[ritualId]);
}

// ---------- Derived views ----------

export function getModuleProgress(module) {
  const total = module.submodules.length;
  const watchedCount = module.submodules.filter((s) => isWatched(s.id)).length;
  return { watchedCount, total };
}

export function getCourseTotals(modules) {
  let total = 0;
  let watchedCount = 0;
  for (const module of modules) {
    total += module.submodules.length;
    watchedCount += module.submodules.filter((s) => isWatched(s.id)).length;
  }
  return { watchedCount, total };
}

// Consecutive days ending today (or yesterday, if today is still empty —
// the day isn't lost until it actually rolls over).
export function getStreak() {
  const day = new Date();
  if (!state.activity[todayKey(day)]) day.setDate(day.getDate() - 1);

  let streak = 0;
  while (state.activity[todayKey(day)]) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

// A streak you've built but haven't defended today is "at risk" — there is
// deliberately no freeze or grace day, so missing today really does reset
// it to zero.
export function getStreakStatus() {
  const streak = getStreak();
  const active = !!state.activity[todayKey()];
  return { streak, atRisk: streak > 0 && !active, active };
}

// ---------- Weekly goal (set by the user) ----------

export function getWeeklyGoal() {
  return state.weeklyGoal;
}

export function setWeeklyGoal(target) {
  state.weeklyGoal = target;
  flush();
}

export function getWeekProgress() {
  const day = startOfWeek();
  const today = new Date();
  let lessons = 0;

  while (day <= today) {
    const entry = state.activity[todayKey(day)];
    if (entry) lessons += entry.lessons || 0;
    day.setDate(day.getDate() + 1);
  }

  return { lessons, target: state.weeklyGoal };
}

export function getTodayCounts() {
  return state.activity[todayKey()] || { lessons: 0, rituals: 0 };
}

// The most-recently-started lesson that isn't finished yet.
export function getResumeTarget(modules) {
  let best = null;
  for (const module of modules) {
    for (const submodule of module.submodules) {
      const p = getProgress(submodule.id);
      if (p > 0 && !isWatched(submodule.id) && (!best || p > best.progress)) {
        best = { module, submodule, progress: p };
      }
    }
  }
  return best;
}

export function getGoals(modules, rituals) {
  const today = getTodayCounts();
  const course = getCourseTotals(modules);
  const ritualsDone = rituals.filter((r) => isRitualCompleteToday(r.id)).length;

  return [
    { label: "Watch a lesson today", current: Math.min(today.lessons, 1), target: 1 },
    { label: "Both daily rituals", current: ritualsDone, target: rituals.length },
    { label: "Finish the course", current: course.watchedCount, target: course.total },
  ].map((g) => ({ ...g, done: g.current >= g.target }));
}
