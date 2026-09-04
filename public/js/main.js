import * as api from "./api.js";
import { initState, flush } from "./state.js";
import { route, start } from "./router.js";
import { renderHome } from "./views/home.js";
import { renderModule } from "./views/module.js";
import { renderLesson, renderRitual } from "./views/player.js";

async function boot() {
  let user;
  try {
    user = await api.me();
  } catch {
    window.location.href = "login.html";
    return;
  }

  await initState();

  const view = document.getElementById("view");
  document.getElementById("user-name").textContent = user.displayName;
  document.getElementById("logout").addEventListener("click", async () => {
    flush();
    await api.logout();
    window.location.href = "login.html";
  });
  document.getElementById("brand").addEventListener("click", () => {
    window.location.hash = "/";
  });

  // Any pending playback position is written out before the view changes.
  window.addEventListener("hashchange", () => flush());
  window.addEventListener("pagehide", () => flush({ beacon: true }));

  route("/", () => renderHome(view));
  route("/m/:moduleId", ({ moduleId }) => renderModule(view, moduleId));
  route("/w/:moduleId/:submoduleId", ({ moduleId, submoduleId }) => renderLesson(view, moduleId, submoduleId));
  route("/r/:ritualId", ({ ritualId }) => renderRitual(view, ritualId));

  start();
}

boot();
