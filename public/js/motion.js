// Motion layer: scroll-reveal choreography and number count-ups.
//
// Only opacity and transform are animated — anything else forces layout
// and shows up as stutter. No animation library; an IntersectionObserver
// and CSS custom properties do the whole job.

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let observer = null;
let sweepQueued = false;

// Failsafe. An IntersectionObserver only reports what it samples, so a
// jump-scroll (End key, anchor link, restored scroll position, a flick on
// a trackpad) can skip an element entirely and leave it stuck at
// opacity 0 — content invisible with no way back. This sweep reveals
// anything that is at or above the fold regardless of whether the
// observer ever saw it cross.
function sweep() {
  if (sweepQueued) return;
  sweepQueued = true;

  requestAnimationFrame(() => {
    sweepQueued = false;
    const limit = window.innerHeight * 0.98;

    for (const el of document.querySelectorAll("[data-reveal]:not(.is-revealed)")) {
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add("is-revealed");
        observer?.unobserve(el);
      }
    }
  });
}

if (!reduced) {
  window.addEventListener("scroll", sweep, { passive: true });
  window.addEventListener("resize", sweep, { passive: true });
}

function ensureObserver() {
  if (observer || reduced) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    },
    // Fire slightly before the element is fully on screen so the motion
    // reads as "arriving with the scroll" rather than catching up to it.
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  return observer;
}

/**
 * Reveal every [data-reveal] inside `root` as it scrolls into view.
 * Siblings stagger via the --stagger index each element carries.
 */
export function revealIn(root) {
  const targets = root.querySelectorAll("[data-reveal]");

  if (reduced) {
    targets.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const io = ensureObserver();
  targets.forEach((el) => {
    el.classList.remove("is-revealed");
    io.observe(el);
  });

  // Anything already on screen at render time reveals straight away.
  sweep();
}

/** Marks children of `el` for staggered reveal. */
export function stagger(el, startAt = 0) {
  [...el.children].forEach((child, i) => {
    child.dataset.reveal = "";
    child.style.setProperty("--stagger", String(startAt + i));
  });
  return el;
}

/**
 * Counts a number up when it first appears. Values like "3/27" count the
 * leading figure and keep the rest.
 */
export function countUp(el, value) {
  const text = String(value);
  const match = text.match(/^(\d+)(.*)$/);

  if (reduced || !match) {
    el.textContent = text;
    return el;
  }

  const target = Number(match[1]);
  const rest = match[2];
  el.textContent = `0${rest}`;

  const run = () => {
    const duration = Math.min(160 + target * 55, 900);
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic, so it decelerates into the final figure
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased)}${rest}`;
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        run();
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.4 }
  );
  io.observe(el);

  return el;
}

/**
 * Splits a heading into words that rise in sequence — the text-splitting
 * technique, done with spans rather than a library.
 */
export function splitWords(el) {
  if (reduced) return el;

  const words = el.textContent.split(/\s+/);
  el.textContent = "";
  el.classList.add("split");

  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.className = "split-word";
    span.style.setProperty("--stagger", String(i));
    span.textContent = word;
    el.append(span);
    if (i < words.length - 1) el.append(document.createTextNode(" "));
  });

  return el;
}
