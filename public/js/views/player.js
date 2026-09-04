// Player: the only place completion happens. Watch past COMPLETE_AT and
// the lesson ticks itself off — there is no manual "mark as done".
//
// When a lesson finishes, an end card takes over the stage: the next
// lesson with a countdown, or — if that was the last one in the module —
// a milestone card for finishing it.

import { modules, rituals } from "../../data/curriculum.js";
import {
  COMPLETE_AT,
  getProgress,
  setProgress,
  completeItem,
  isWatched,
  isRitualCompleteToday,
  getModuleProgress,
  getStreak,
} from "../state.js";
import { el, progressBar, setBackdrop } from "../ui.js";
import { go } from "../router.js";

const UP_NEXT_SECONDS = 8;

// Set just before an autoplay navigation, consumed by the next render.
let autoplayPending = false;

// The up-next countdown, held here so leaving the view can stop it.
let countdown = null;

export function cancelCountdown() {
  if (countdown) clearInterval(countdown);
  countdown = null;
}

function findLesson(moduleId, submoduleId) {
  const module = modules.find((m) => m.id === moduleId);
  const index = module?.submodules.findIndex((s) => s.id === submoduleId) ?? -1;
  if (!module || index === -1) return null;

  return {
    item: module.submodules[index],
    module,
    next: module.submodules[index + 1] || null,
    ritual: false,
    backdrop: module.image,
    backLabel: `← ${module.title}`,
    backTo: `/m/${module.id}`,
    subtitle: module.title,
    done: isWatched(module.submodules[index].id),
  };
}

function findRitual(ritualId) {
  const ritual = rituals.find((r) => r.id === ritualId);
  if (!ritual) return null;
  return {
    item: ritual,
    module: null,
    next: null,
    ritual: true,
    backdrop: null,
    backLabel: "← Home",
    backTo: "/",
    subtitle: `${ritual.period} · Daily ritual`,
    done: isRitualCompleteToday(ritual.id),
  };
}

// ---------- End cards ----------

function upNextCard(ctx, onDismiss) {
  const card = el("div", "endcard");
  let remaining = UP_NEXT_SECONDS;

  const count = el("span", "endcard-count", String(remaining));
  const goNext = () => {
    cancelCountdown();
    autoplayPending = true;
    go(`/w/${ctx.module.id}/${ctx.next.id}`);
  };

  cancelCountdown();
  countdown = setInterval(() => {
    remaining -= 1;
    count.textContent = String(remaining);
    if (remaining <= 0) goNext();
  }, 1000);

  const playNow = el("button", "endcard-primary", "Play now");
  playNow.type = "button";
  playNow.addEventListener("click", goNext);

  const stay = el("button", "endcard-secondary", "Stay here");
  stay.type = "button";
  stay.addEventListener("click", () => {
    cancelCountdown();
    onDismiss();
  });

  card.append(
    el("span", "endcard-label", "Up next"),
    el("h2", "endcard-title", ctx.next.title),
    el("p", "endcard-sub", ["Starting in ", count, "s"]),
    el("div", "endcard-actions", [playNow, stay])
  );

  return card;
}

function milestoneCard(ctx, onDismiss) {
  const { watchedCount, total } = getModuleProgress(ctx.module);
  const nextModule = modules[modules.findIndex((m) => m.id === ctx.module.id) + 1] || null;

  const card = el("div", "endcard is-milestone");
  const burst = el("div", "burst");
  burst.innerHTML = `<span class="burst-ring"></span><span class="burst-ring"></span><span class="burst-ring"></span>`;

  const actions = el("div", "endcard-actions");
  if (nextModule) {
    const next = el("button", "endcard-primary", `Start ${nextModule.title}`);
    next.type = "button";
    next.addEventListener("click", () => go(`/m/${nextModule.id}`));
    actions.append(next);
  }
  const home = el("button", "endcard-secondary", "Back to modules");
  home.type = "button";
  home.addEventListener("click", () => go("/"));
  actions.append(home);

  const streak = getStreak();
  card.append(
    burst,
    el("span", "endcard-label", "Module complete"),
    el("h2", "endcard-title", ctx.module.title),
    el("p", "endcard-sub", `All ${watchedCount} of ${total} lessons · ${streak}-day streak`),
    actions
  );

  return card;
}

// ---------- View ----------

function render(view, ctx) {
  const { item, ritual } = ctx;
  setBackdrop(ctx.backdrop);

  const back = el("button", "back", ctx.backLabel);
  back.type = "button";
  back.addEventListener("click", () => go(ctx.backTo));

  const status = el("span", "player-status", ctx.done ? "Complete" : "Completes automatically");
  const bar = progressBar(ctx.done ? 1 : getProgress(item.id));
  const stage = el("div", "player-stage");

  if (item.videoUrl) {
    const video = el("video", "player-video");
    video.src = item.videoUrl;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.addEventListener("loadedmetadata", () => {
      const saved = getProgress(item.id);
      if (saved > 0 && saved < COMPLETE_AT && video.duration) {
        video.currentTime = saved * video.duration;
      }
      if (autoplayPending) {
        autoplayPending = false;
        // May be refused by the browser's autoplay policy; if so the
        // viewer just presses play themselves.
        video.play().catch(() => {});
      }
    });

    let completed = ctx.done;
    let endcard = null;

    const showEndCard = () => {
      const dismiss = () => {
        if (!endcard) return;
        endcard.remove();
        endcard = null;
      };

      const moduleDone =
        ctx.module && getModuleProgress(ctx.module).watchedCount === ctx.module.submodules.length;

      if (moduleDone) endcard = milestoneCard(ctx, dismiss);
      else if (ctx.next) endcard = upNextCard(ctx, dismiss);
      else return;

      stage.append(endcard);
    };

    const onProgress = () => {
      if (!video.duration) return;
      const fraction = video.currentTime / video.duration;
      setProgress(item.id, fraction);
      bar.firstChild.style.width = `${Math.round(Math.min(fraction, 1) * 100)}%`;

      if (!completed && fraction >= COMPLETE_AT) {
        completed = true;
        completeItem(item.id, { ritual });
        status.textContent = "Complete";
        stage.classList.add("is-complete");
        showEndCard();
      }
    };

    video.addEventListener("timeupdate", onProgress);
    video.addEventListener("ended", onProgress);
    stage.append(video);
    if (ctx.done) stage.classList.add("is-complete");
  } else {
    stage.append(
      el("p", "player-empty", "No video attached yet — add a videoUrl for this item in data/curriculum.js.")
    );
  }

  view.replaceChildren(
    el("div", "player", [
      back,
      stage,
      el("div", "player-meta", [
        el("div", "player-titles", [
          el("h1", "player-title", item.title),
          el("span", "player-sub", ctx.subtitle),
        ]),
        status,
      ]),
      bar,
    ])
  );
}

export function renderLesson(view, moduleId, submoduleId) {
  const ctx = findLesson(moduleId, submoduleId);
  if (!ctx) return go("/");
  render(view, ctx);
}

export function renderRitual(view, ritualId) {
  const ctx = findRitual(ritualId);
  if (!ctx) return go("/");
  render(view, ctx);
}
