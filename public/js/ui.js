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

// Sun for the morning ritual, moon for the evening — a small piece of
// the day's shape rather than two identical cards.
export function sunMoon(period) {
  const span = el("span", "glyph");
  span.innerHTML =
    period === "AM"
      ? `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
           <circle cx="12" cy="12" r="4.4" class="glyph-fill"/>
           ${[0, 1, 2, 3, 4, 5, 6, 7]
             .map((i) => {
               const a = (Math.PI / 4) * i;
               const x1 = (12 + Math.cos(a) * 7.4).toFixed(2);
               const y1 = (12 + Math.sin(a) * 7.4).toFixed(2);
               const x2 = (12 + Math.cos(a) * 10).toFixed(2);
               const y2 = (12 + Math.sin(a) * 10).toFixed(2);
               return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="glyph-stroke"/>`;
             })
             .join("")}
         </svg>`
      : `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
           <path d="M 16.6 15.4 A 7.2 7.2 0 1 1 11.2 4.2 A 5.8 5.8 0 0 0 16.6 15.4 Z" class="glyph-fill"/>
           <circle cx="17.6" cy="6.2" r="0.9" class="glyph-fill" opacity="0.7"/>
           <circle cx="19.8" cy="9.6" r="0.6" class="glyph-fill" opacity="0.5"/>
         </svg>`;
  return span;
}

// The module picture behind the app; null clears it.
export function setBackdrop(imageUrl) {
  const backdrop = document.getElementById("backdrop");
  backdrop.style.backgroundImage = imageUrl ? `url("${imageUrl}")` : "";
  backdrop.classList.toggle("is-active", !!imageUrl);
}
