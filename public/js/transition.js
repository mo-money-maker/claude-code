// Shared-element zoom between a module row and the module's hero.
//
// The technique is FLIP: measure where the art is now, render the new
// view, measure where the art lands, then animate a stand-in ("ghost")
// from the first rect to the second using transform only.
//
// The aspect ratio changes on the way (a 168x104 row thumbnail becomes a
// wide hero), and scaling one box non-uniformly would smear the artwork.
// So the ghost is two nested layers: an outer frame that takes the
// non-uniform scale and clips, and an inner image that counter-scales by
// exactly the inverse. The picture stays square while the window around
// it grows — which is what reads as moving into the module rather than
// stretching it.

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DURATION = 620;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

let pending = null;

/** Call with the element being zoomed from, just before navigating. */
export function beginZoom(sourceEl, art) {
  if (reduced || !sourceEl) return;
  pending = { rect: sourceEl.getBoundingClientRect(), art };
}

/**
 * Call with the element being zoomed to, right after the new view is in
 * the DOM. No-ops when nothing is pending, so ordinary navigation (a
 * typed URL, the back button) still works.
 */
export function completeZoom(targetEl) {
  const flight = pending;
  pending = null;
  if (!flight || reduced || !targetEl) return;

  const to = targetEl.getBoundingClientRect();
  if (!to.width || !to.height) return;

  const from = flight.rect;
  const scaleX = from.width / to.width;
  const scaleY = from.height / to.height;
  const dx = from.left - to.left;
  const dy = from.top - to.top;

  const ghost = document.createElement("div");
  ghost.className = "zoom-ghost";
  ghost.style.left = `${to.left}px`;
  ghost.style.top = `${to.top}px`;
  ghost.style.width = `${to.width}px`;
  ghost.style.height = `${to.height}px`;
  ghost.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scaleX}, ${scaleY})`;

  const img = document.createElement("div");
  img.className = "zoom-ghost-img";
  img.style.backgroundImage = `url("${flight.art}")`;
  img.style.transform = `scale(${1 / scaleX}, ${1 / scaleY})`;
  ghost.append(img);

  document.body.append(ghost);

  // Hold the real hero back so there's only ever one copy on screen.
  targetEl.style.opacity = "0";

  requestAnimationFrame(() => {
    ghost.style.transition = `transform ${DURATION}ms ${EASE}, opacity 180ms linear ${DURATION - 160}ms`;
    img.style.transition = `transform ${DURATION}ms ${EASE}`;
    ghost.style.transform = "translate3d(0, 0, 0) scale(1, 1)";
    img.style.transform = "scale(1, 1)";
    ghost.style.opacity = "0";
  });

  const land = () => {
    targetEl.style.opacity = "";
    ghost.remove();
  };

  ghost.addEventListener("transitionend", (e) => {
    if (e.propertyName === "opacity") land();
  });
  // Belt and braces: if the tab is backgrounded mid-flight the
  // transitionend never fires, and the hero must not stay invisible.
  setTimeout(land, DURATION + 260);
}

/** True while a zoom is queued, so views can skip their own entrance. */
export function zoomPending() {
  return pending !== null;
}

// Which module the home view should land a returning zoom on. Read once,
// then cleared, so a later plain navigation doesn't reuse it.
let returnTarget = null;

export function setReturnTarget(moduleId) {
  returnTarget = moduleId;
}

export function takeReturnTarget() {
  const id = returnTarget;
  returnTarget = null;
  return id;
}
