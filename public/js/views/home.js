// Home: goals and counters up top, the scrollable module shelf as the way
// in, daily rituals underneath.

import { modules, rituals } from "../../data/curriculum.js";
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
import { el, statusRing, progressBar, setBackdrop } from "../ui.js";
import { go } from "../router.js";

function statTile(value, label, className) {
  return el("div", "stat" + (className ? ` ${className}` : ""), [
    el("span", "stat-value", String(value)),
    el("span", "stat-label", label),
  ]);
}

function statRow() {
  const course = getCourseTotals(modules);
  const ritualsDone = rituals.filter((r) => isRitualCompleteToday(r.id)).length;
  const { streak, atRisk } = getStreakStatus();

  return el("div", "stat-row", [
    statTile(streak, "day streak", atRisk ? "is-at-risk" : streak > 0 ? "is-live" : ""),
    statTile(`${course.watchedCount}/${course.total}`, "lessons watched"),
    statTile(`${ritualsDone}/${rituals.length}`, "rituals today"),
  ]);
}

// No freeze, no grace day — the point is that today is the only day that
// can defend the streak.
function streakCallout() {
  const { streak, atRisk } = getStreakStatus();
  if (!atRisk) return null;

  return el("div", "callout", [
    el("span", "callout-strong", `${streak}-day streak on the line.`),
    el("span", "callout-text", " Watch one lesson today or it resets to zero."),
  ]);
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

  return el("section", "weekly" + (hit ? " is-hit" : ""), [
    el("div", "weekly-head", [
      el("div", "weekly-titles", [
        el("h2", "section-label", "This week"),
        el("span", "weekly-count", [
          el("strong", null, String(lessons)),
          ` of ${target} lessons`,
        ]),
      ]),
      el("div", "weekly-target", [el("span", "target-label", "Weekly target"), options]),
    ]),
    progressBar(target ? lessons / target : 0),
  ]);
}

function goalList() {
  const goals = getGoals(modules, rituals);
  return el("section", "goals", [
    el("h2", "section-label", "Today's goals"),
    el(
      "ul",
      "goal-list",
      goals.map((g) =>
        el("li", "goal" + (g.done ? " is-done" : ""), [
          statusRing(g.current / g.target, 18),
          el("span", "goal-label", g.label),
          el("span", "goal-count", `${g.current}/${g.target}`),
        ])
      )
    ),
  ]);
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
  btn.addEventListener("click", () => go(`/w/${target.module.id}/${target.submodule.id}`));
  return btn;
}

function moduleCard(module) {
  const { watchedCount, total } = getModuleProgress(module);
  const complete = watchedCount === total;

  const card = el("button", "module-card" + (complete ? " is-complete" : ""));
  card.type = "button";

  const art = el("div", "module-art");
  art.style.backgroundImage = `url("${module.image}")`;

  const artWrap = el("div", "module-art-wrap", [art]);
  if (complete) artWrap.append(el("span", "module-badge", "Complete"));

  card.append(
    artWrap,
    el("div", "module-info", [
      el("h3", "module-name", module.title),
      el("p", "module-blurb", module.blurb),
      el("div", "module-meta", [
        progressBar(total ? watchedCount / total : 0),
        el("span", "module-count", `${watchedCount}/${total}`),
      ]),
    ])
  );

  card.addEventListener("click", () => go(`/m/${module.id}`));
  return card;
}

function moduleShelf() {
  const shelf = el("div", "shelf", modules.map(moduleCard));

  // Plain vertical wheel scrolls the shelf sideways, so you can spin
  // through modules without a trackpad gesture.
  shelf.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      shelf.scrollLeft += e.deltaY;
    },
    { passive: false }
  );

  return el("section", "shelf-section", [
    el("h2", "section-label", "Modules"),
    shelf,
    el("p", "shelf-hint", "Scroll to move through the course"),
  ]);
}

function ritualCard(ritual) {
  const done = isRitualCompleteToday(ritual.id);
  const card = el("button", "ritual" + (done ? " is-complete" : ""));
  card.type = "button";
  card.append(
    statusRing(done ? 1 : getProgress(ritual.id)),
    el("div", "ritual-body", [
      el("span", "ritual-period", ritual.period),
      el("span", "ritual-title", ritual.title),
      el("span", "ritual-subtitle", ritual.subtitle),
    ])
  );
  card.addEventListener("click", () => go(`/r/${ritual.id}`));
  return card;
}

export function renderHome(view) {
  setBackdrop(null);
  view.replaceChildren(
    el("div", "home", [
      statRow(),
      streakCallout(),
      weeklyGoalCard(),
      goalList(),
      resumeRow(),
      moduleShelf(),
      el("section", "rituals-section", [
        el("h2", "section-label", "Daily rituals"),
        el("div", "ritual-row", rituals.map(ritualCard)),
      ]),
    ])
  );
}
