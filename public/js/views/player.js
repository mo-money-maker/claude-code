// Player: the only place completion happens. Watch past COMPLETE_AT and
// the lesson ticks itself off — there is no manual "mark as done".

import { modules, rituals } from "../../data/curriculum.js";
import { COMPLETE_AT, getProgress, setProgress, completeItem, isWatched, isRitualCompleteToday } from "../state.js";
import { el, progressBar, setBackdrop } from "../ui.js";
import { go } from "../router.js";

function findLesson(moduleId, submoduleId) {
  const module = modules.find((m) => m.id === moduleId);
  const submodule = module?.submodules.find((s) => s.id === submoduleId);
  if (!module || !submodule) return null;
  return {
    item: submodule,
    ritual: false,
    backdrop: module.image,
    backLabel: `← ${module.title}`,
    backTo: `/m/${module.id}`,
    subtitle: module.title,
    done: isWatched(submodule.id),
  };
}

function findRitual(ritualId) {
  const ritual = rituals.find((r) => r.id === ritualId);
  if (!ritual) return null;
  return {
    item: ritual,
    ritual: true,
    backdrop: null,
    backLabel: "← Home",
    backTo: "/",
    subtitle: `${ritual.period} · Daily ritual`,
    done: isRitualCompleteToday(ritual.id),
  };
}

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

    // Pick up where they left off, unless they've already finished it.
    video.addEventListener("loadedmetadata", () => {
      const saved = getProgress(item.id);
      if (saved > 0 && saved < COMPLETE_AT && video.duration) {
        video.currentTime = saved * video.duration;
      }
    });

    let completed = ctx.done;
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
