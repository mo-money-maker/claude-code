// Home: the daily intention, where you stand, then the course as a
// vertical set of rows that arrive as you scroll. No sliders.

import { modules, rituals, mantras } from "../../data/curriculum.js";
import {
  getStreakStatus,
  getCourseTotals,
  getModuleProgress,
  getProgress,
  getGoals,
  getResumeTarget,
  getWeeklyGoal,
  setWeeklyGoal,
  getWeekProgress,
  isRitualCompleteToday,
  WEEKLY_GOAL_OPTIONS,
} from "../state.js";
import { el, statusRing, progressBar, setBackdrop, sunMoon } from "../ui.js";
import { artFor } from "../art.js";
import { revealIn, stagger, countUp } from "../motion.js";
import { go } from "../router.js";

// One line per day, chosen by the date — no scheduling, never repeats
// twice running, and it changes on its own overnight.
function mantraForToday() {
  const now = new Date();
  const dayNumber = Math.floor(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000
  );
  return mantras[dayNumber % mantras.length];
}

function invocation() {
  const section = el("section", "invocation", [
    el("span", "invocation-mark", "∞"),
    el("p", "invocation-line", mantraForToday()),
  ]);
  section.dataset.reveal = "";
  return section;
}

function statTile(value, label, className) {
  const valueEl = el("span", "stat-value");
  countUp(valueEl, value);
  return el("div", "stat" + (className ? ` ${className}` : ""), [
    valueEl,
    el("span", "stat-label", label),
  ]);
}

function statRow() {
  const course = getCourseTotals(modules);
  const ritualsDone = rituals.filter((r) => isRitualCompleteToday(r.id)).length;
  const { streak, atRisk } = getStreakStatus();

  const row = el("div", "stat-row", [
    statTile(streak, "day streak", atRisk ? "is-at-risk" : streak > 0 ? "is-live" : ""),
    statTile(`${course.watchedCount}/${course.total}`, "lessons watched"),
    statTile(`${ritualsDone}/${rituals.length}`, "rituals today"),
  ]);
  return stagger(row);
}

// No freeze, no grace day — today is the only day that can defend it.
function streakCallout() {
  const { streak, atRisk } = getStreakStatus();
  if (!atRisk) return null;

  const box = el("div", "callout", [
    el("span", "callout-strong", `${streak}-day streak on the line.`),
    el("span", "callout-text", " Watch one lesson today or it resets to zero."),
  ]);
  box.dataset.reveal = "";
  return box;
}

function weeklyGoalCard() {
  const { lessons, target } = getWeekProgress();
  const hit = lessons >= target;

  const options = el(
    "div",
    "target-options",
    WEEKLY_GOAL_OPTIONS.map((n) => {
      const btn = el("button", "target" + (n === getWeeklyGoal() ? " is-active" : ""), String(n));
      btn.type = "button";
      btn.addEventListener("click", () => {
        setWeeklyGoal(n);
        renderHome(document.getElementById("view"));
      });
      return btn;
    })
  );

  const card = el("section", "weekly" + (hit ? " is-hit" : ""), [
    el("div", "weekly-head", [
      el("div", "weekly-titles", [
        el("h2", "section-label", "This week"),
        el("span", "weekly-count", [el("strong", null, String(lessons)), ` of ${target} lessons`]),
      ]),
      el("div", "weekly-target", [el("span", "target-label", "Weekly target"), options]),
    ]),
    progressBar(target ? lessons / target : 0),
  ]);
  card.dataset.reveal = "";
  return card;
}

function goalList() {
  const goals = getGoals(modules, rituals);
  const list = el(
    "ul",
    "goal-list",
    goals.map((g) =>
      el("li", "goal" + (g.done ? " is-done" : ""), [
        statusRing(g.current / g.target, 18),
        el("span", "goal-label", g.label),
        el("span", "goal-count", `${g.current}/${g.target}`),
      ])
    )
  );

  const section = el("section", "goals", [el("h2", "section-label", "Today's goals"), stagger(list)]);
  section.dataset.reveal = "";
  return section;
}

function resumeRow() {
  const target = getResumeTarget(modules);
  if (!target) return null;

  const btn = el("button", "resume", [
    el("span", "resume-label", "Resume"),
    el("span", "resume-title", target.submodule.title),
    progressBar(target.progress),
  ]);
  btn.type = "button";
  btn.dataset.reveal = "";
  btn.addEventListener("click", () => go(`/w/${target.module.id}/${target.submodule.id}`));
  return btn;
}

// A full-width row per module — art on the left, the state of it on the
// right. Each one rises into place as it reaches the viewport.
function moduleRow(module, index) {
  const { watchedCount, total } = getModuleProgress(module);
  const complete = watchedCount === total;
  const started = watchedCount > 0;

  const row = el("button", "module-row" + (complete ? " is-complete" : ""));
  row.type = "button";
  row.dataset.reveal = "";
  row.style.setProperty("--stagger", String(index % 4));

  const art = el("div", "row-art");
  art.style.backgroundImage = `url("${artFor(module, index)}")`;

  const artWrap = el("div", "row-art-wrap", [art, el("span", "row-sheen")]);
  if (complete) artWrap.append(el("span", "module-badge", "Complete"));

  row.append(
    artWrap,
    el("div", "row-body", [
      el("span", "row-kicker", module.kicker || ""),
      el("h3", "row-title", module.title),
      el("p", "row-blurb", module.blurb),
      el("div", "row-meta", [
        progressBar(total ? watchedCount / total : 0),
        el("span", "row-count", `${watchedCount}/${total}`),
      ]),
    ]),
    el("span", "row-cue", complete ? "Revisit" : started ? "Continue" : "Begin")
  );

  row.addEventListener("click", () => go(`/m/${module.id}`));
  return row;
}

function moduleRows() {
  const section = el("section", "rows-section", [
    el("h2", "section-label", "The path"),
    el("div", "module-rows", modules.map(moduleRow)),
  ]);
  return section;
}

function ritualCard(ritual) {
  const done = isRitualCompleteToday(ritual.id);
  const card = el("button", "ritual" + (done ? " is-complete" : ""));
  card.type = "button";
  card.append(
    el("span", "ritual-glyph", sunMoon(ritual.period)),
    el("div", "ritual-body", [
      el("span", "ritual-period", ritual.period),
      el("span", "ritual-title", ritual.title),
      el("span", "ritual-subtitle", ritual.subtitle),
    ]),
    statusRing(done ? 1 : getProgress(ritual.id))
  );
  card.addEventListener("click", () => go(`/r/${ritual.id}`));
  return card;
}

function ritualsSection() {
  const row = el("div", "ritual-row", rituals.map(ritualCard));
  const section = el("section", "rituals-section", [
    el("h2", "section-label", "Daily rituals"),
    stagger(row),
  ]);
  section.dataset.reveal = "";
  return section;
}

export function renderHome(view) {
  setBackdrop(null);

  const home = el("div", "home", [
    invocation(),
    statRow(),
    streakCallout(),
    weeklyGoalCard(),
    goalList(),
    resumeRow(),
    moduleRows(),
    ritualsSection(),
  ]);

  view.replaceChildren(home);
  revealIn(home);
}
