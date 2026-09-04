// Minimal hash router. Everything is one page; clicking navigates between
// views without a reload.

const routes = [];

export function route(pattern, handler) {
  routes.push({ parts: pattern.split("/"), handler });
}

export function go(path) {
  window.location.hash = path;
}

function resolve() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/");

  for (const r of routes) {
    if (r.parts.length !== parts.length) continue;

    const params = {};
    let matched = true;
    for (let i = 0; i < r.parts.length; i++) {
      const p = r.parts[i];
      if (p.startsWith(":")) params[p.slice(1)] = decodeURIComponent(parts[i]);
      else if (p !== parts[i]) { matched = false; break; }
    }
    if (matched) return r.handler(params);
  }

  go("/");
}

export function start() {
  window.addEventListener("hashchange", resolve);
  resolve();
}
