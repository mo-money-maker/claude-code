import * as api from "./api.js";
import { initState, flush } from "./state.js";
import { route, start } from "./router.js";
import { startParallax } from "./motion.js";
import { renderHome } from "./views/home.js";
import { renderModule } from "./views/module.js";
import { renderLesson, renderRitual, cancelCountdown } from "./views/player.js";

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
  document.getElementById("user-menu-email").textContent = user.email;
  document.getElementById("user-sigil").textContent = (user.displayName || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  // User menu. Opening it only changes opacity/transform on an absolutely
  // positioned panel, so the bar underneath never shifts.
  const userButton = document.getElementById("user-button");
  const userMenu = document.getElementById("user-menu");

  const setMenu = (open) => {
    userMenu.classList.toggle("is-open", open);
    userButton.setAttribute("aria-expanded", String(open));
  };

  userButton.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenu(!userMenu.classList.contains("is-open"));
  });
  document.addEventListener("click", (e) => {
    if (!userMenu.contains(e.target)) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  document.getElementById("logout").addEventListener("click", async () => {
    flush();
    await api.logout();
    window.location.href = "login.html";
  });

  startParallax();
  document.getElementById("brand").addEventListener("click", () => {
    window.location.hash = "/";
  });

  // Any pending playback position is written out before the view changes.
  window.addEventListener("hashchange", () => {
    cancelCountdown();
    flush();
  });
  window.addEventListener("pagehide", () => flush({ beacon: true }));

  route("/", () => renderHome(view));
  route("/m/:moduleId", ({ moduleId }) => renderModule(view, moduleId));
  route("/w/:moduleId/:submoduleId", ({ moduleId, submoduleId }) => renderLesson(view, moduleId, submoduleId));
  route("/r/:ritualId", ({ ritualId }) => renderRitual(view, ritualId));

  start();
}

boot();
