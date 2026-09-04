// Module view: the module's own picture becomes the page background, with
// its lessons listed over the top.

import { modules } from "../../data/curriculum.js";
import { getModuleProgress, getProgress, isWatched } from "../state.js";
import { el, statusRing, progressBar, setBackdrop } from "../ui.js";
import { go } from "../router.js";

function lessonRow(module, submodule) {
  const watched = isWatched(submodule.id);
  const fraction = watched ? 1 : getProgress(submodule.id);

  const row = el("button", "lesson" + (watched ? " is-complete" : ""));
  row.type = "button";
  row.append(
    statusRing(fraction),
    el("span", "lesson-title", submodule.title),
    el("span", "lesson-status", watched ? "Watched" : fraction > 0 ? `${Math.round(fraction * 100)}%` : "")
  );
  row.addEventListener("click", () => go(`/w/${module.id}/${submodule.id}`));
  return row;
}

export function renderModule(view, moduleId) {
  const module = modules.find((m) => m.id === moduleId);
  if (!module) return go("/");

  setBackdrop(module.image);
  const { watchedCount, total } = getModuleProgress(module);

  const back = el("button", "back", "← All modules");
  back.type = "button";
  back.addEventListener("click", () => go("/"));

  view.replaceChildren(
    el("div", "module-view", [
      back,
      el("h1", "module-heading", module.title),
      el("p", "module-sub", module.blurb),
      el("div", "module-progress-row", [
        progressBar(total ? watchedCount / total : 0),
        el("span", "module-count", `${watchedCount}/${total}`),
      ]),
      el("div", "lesson-list", module.submodules.map((s) => lessonRow(module, s))),
    ])
  );
}
