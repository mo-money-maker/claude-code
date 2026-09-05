// Module view: the module's key art leads, becomes the page background,
// and the lessons arrive underneath as you scroll.

import { modules } from "../../data/curriculum.js";
import { getModuleProgress, getProgress, isWatched } from "../state.js";
import { el, statusRing, progressBar, setBackdrop } from "../ui.js";
import { artFor } from "../art.js";
import { revealIn, splitWords } from "../motion.js";
import { go } from "../router.js";

function lessonRow(module, submodule, index) {
  const watched = isWatched(submodule.id);
  const fraction = watched ? 1 : getProgress(submodule.id);

  const row = el("button", "lesson" + (watched ? " is-complete" : ""));
  row.type = "button";
  row.dataset.reveal = "";
  row.style.setProperty("--stagger", String(index));

  row.append(
    el("span", "lesson-index", String(index + 1).padStart(2, "0")),
    statusRing(fraction),
    el("span", "lesson-title", submodule.title),
    el(
      "span",
      "lesson-status",
      watched ? "Watched" : fraction > 0 ? `${Math.round(fraction * 100)}%` : ""
    )
  );
  row.addEventListener("click", () => go(`/w/${module.id}/${submodule.id}`));
  return row;
}

export function renderModule(view, moduleId) {
  const index = modules.findIndex((m) => m.id === moduleId);
  const module = modules[index];
  if (!module) return go("/");

  const art = artFor(module, index);
  const banner = artFor(module, index, "banner");
  setBackdrop(art);

  const { watchedCount, total } = getModuleProgress(module);

  const back = el("button", "back", "← The path");
  back.type = "button";
  back.addEventListener("click", () => go("/"));

  const hero = el("div", "module-hero");
  hero.style.backgroundImage = `url("${banner}")`;
  hero.dataset.reveal = "";

  const heading = el("h1", "module-heading", module.title);

  const body = el("div", "module-view", [
    back,
    hero,
    el("div", "module-intro", [
      el("span", "row-kicker", module.kicker || ""),
      heading,
      el("p", "module-sub", module.blurb),
      el("div", "module-progress-row", [
        progressBar(total ? watchedCount / total : 0),
        el("span", "row-count", `${watchedCount}/${total}`),
      ]),
    ]),
    el("div", "lesson-list", module.submodules.map((s, i) => lessonRow(module, s, i))),
  ]);

  view.replaceChildren(body);
  splitWords(heading);
  revealIn(body);
}
