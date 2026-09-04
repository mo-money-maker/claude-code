// Shared DOM helpers.

export function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (children != null) {
    for (const child of Array.isArray(children) ? children : [children]) {
      if (child == null) continue;
      node.append(typeof child === "string" ? document.createTextNode(child) : child);
    }
  }
  return node;
}

// Status ring: hollow when untouched, a gold arc while part-watched, solid
// gold once complete. Nothing about it is clickable — completion is earned
// by watching, not by ticking a box.
export function statusRing(fraction, size = 20) {
  const complete = fraction >= 1;
  const r = (size - 3) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * Math.min(Math.max(fraction, 0), 1);

  const wrap = el("span", "ring" + (complete ? " is-complete" : ""));
  wrap.style.width = `${size}px`;
  wrap.style.height = `${size}px`;
  wrap.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
      <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="1.5" />
      <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="1.5"
              stroke-dasharray="${dash} ${circumference}"
              transform="rotate(-90 ${size / 2} ${size / 2})" stroke-linecap="round" />
      ${complete ? `<circle class="ring-core" cx="${size / 2}" cy="${size / 2}" r="${r - 3.5}" />` : ""}
    </svg>`;
  return wrap;
}

export function progressBar(fraction) {
  const bar = el("div", "bar");
  const fill = el("div", "bar-fill");
  fill.style.width = `${Math.round(Math.min(Math.max(fraction, 0), 1) * 100)}%`;
  bar.append(fill);
  return bar;
}

// The module picture behind the app; null clears it.
export function setBackdrop(imageUrl) {
  const backdrop = document.getElementById("backdrop");
  backdrop.style.backgroundImage = imageUrl ? `url("${imageUrl}")` : "";
  backdrop.classList.toggle("is-active", !!imageUrl);
}
