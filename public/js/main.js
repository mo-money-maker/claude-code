import * as api from "./api.js";
import { initState } from "./state.js";
import { init as initRender } from "./render.js";

async function boot() {
  let user;
  try {
    user = await api.me();
  } catch {
    window.location.href = "login.html";
    return;
  }

  await initState();
  initRender(user.displayName);

  document.getElementById("rail-logout").addEventListener("click", async () => {
    await api.logout();
    window.location.href = "login.html";
  });
}

boot();
