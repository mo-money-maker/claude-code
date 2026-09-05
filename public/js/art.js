// Branded module artwork, generated from the module's own data.
//
// This is the "no retouches" part: add a module to data/curriculum.js and
// it gets on-brand key art automatically — gold foil lettering on black,
// marble veining, sacred geometry, the infinity mark. Set `image` on a
// module to override it with your own file when you have one.
//
// Note on type: an SVG used as a CSS background renders in its own
// isolated document, so webfonts don't reach it. The lettering therefore
// uses a system serif, which is the right register for this anyway.

const SERIF = "Georgia, 'Times New Roman', Times, serif";

// Sacred-geometry motifs. Each returns SVG markup drawn around (600, 380).
const MOTIFS = {
  // Seed of life — seven interlocking circles
  seed: () => {
    const r = 132;
    let out = `<circle cx="600" cy="380" r="${r}" class="geo"/>`;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      out += `<circle cx="${(600 + Math.cos(a) * r).toFixed(1)}" cy="${(380 + Math.sin(a) * r).toFixed(1)}" r="${r}" class="geo"/>`;
    }
    return out + `<circle cx="600" cy="380" r="${r * 2}" class="geo faint"/>`;
  },

  // Concentric rings with radiating spokes — trance / induction
  rings: () => {
    let out = "";
    for (let i = 1; i <= 6; i++) {
      out += `<circle cx="600" cy="380" r="${i * 46}" class="geo" opacity="${(0.75 - i * 0.09).toFixed(2)}"/>`;
    }
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI / 6) * i;
      out += `<line x1="${(600 + Math.cos(a) * 70).toFixed(1)}" y1="${(380 + Math.sin(a) * 70).toFixed(1)}" x2="${(600 + Math.cos(a) * 290).toFixed(1)}" y2="${(380 + Math.sin(a) * 290).toFixed(1)}" class="geo faint"/>`;
    }
    return out;
  },

  // The eye — vision
  eye: () => `
    <path d="M 380 380 Q 600 200 820 380 Q 600 560 380 380 Z" class="geo"/>
    <circle cx="600" cy="380" r="86" class="geo"/>
    <circle cx="600" cy="380" r="40" class="geo solid"/>
    <circle cx="600" cy="380" r="150" class="geo faint"/>
    <circle cx="600" cy="380" r="215" class="geo faint"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const a = (Math.PI / 4) * i;
      return `<line x1="${(600 + Math.cos(a) * 230).toFixed(1)}" y1="${(380 + Math.sin(a) * 230).toFixed(1)}" x2="${(600 + Math.cos(a) * 300).toFixed(1)}" y2="${(380 + Math.sin(a) * 300).toFixed(1)}" class="geo faint"/>`;
    }).join("")}`,

  // Hexagram in a ring — structure, system
  hexagram: () => {
    const pts = (offset) =>
      [0, 1, 2]
        .map((i) => {
          const a = (Math.PI * 2 / 3) * i + offset;
          return `${(600 + Math.cos(a) * 175).toFixed(1)},${(380 + Math.sin(a) * 175).toFixed(1)}`;
        })
        .join(" ");
    return `
      <polygon points="${pts(-Math.PI / 2)}" class="geo"/>
      <polygon points="${pts(Math.PI / 2)}" class="geo"/>
      <circle cx="600" cy="380" r="175" class="geo faint"/>
      <circle cx="600" cy="380" r="238" class="geo faint"/>`;
  },

  // Standing wave — state anchoring
  wave: () => {
    let out = `<circle cx="600" cy="380" r="250" class="geo faint"/>`;
    for (let i = 0; i < 5; i++) {
      const amp = 40 + i * 26;
      out += `<path d="M 330 380 Q 465 ${380 - amp} 600 380 T 870 380" class="geo" opacity="${(0.7 - i * 0.11).toFixed(2)}"/>`;
      out += `<path d="M 330 380 Q 465 ${380 + amp} 600 380 T 870 380" class="geo" opacity="${(0.7 - i * 0.11).toFixed(2)}"/>`;
    }
    return out;
  },

  // Ascent — mastery, levels
  ascent: () => `
    <path d="M 350 520 L 480 520 L 480 440 L 610 440 L 610 360 L 740 360 L 740 280 L 870 280" class="geo solid-stroke"/>
    <circle cx="870" cy="280" r="16" class="geo solid"/>
    <circle cx="600" cy="380" r="250" class="geo faint"/>
    <circle cx="600" cy="380" r="190" class="geo faint"/>`,

  // Vesica piscis — union, influence, meeting of two
  vesica: () => `
    <circle cx="510" cy="380" r="165" class="geo"/>
    <circle cx="690" cy="380" r="165" class="geo"/>
    <circle cx="600" cy="380" r="238" class="geo faint"/>
    <circle cx="510" cy="380" r="7" class="geo solid"/>
    <circle cx="690" cy="380" r="7" class="geo solid"/>`,
};

const MOTIF_ORDER = ["ascent", "seed", "rings", "wave", "hexagram", "vesica", "eye"];

// Deterministic pseudo-random so a given module always looks the same.
function seeded(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function marbleVeins(rand, w = 1200, h = 800) {
  let out = "";
  for (let i = 0; i < 5; i++) {
    const y = rand() * h;
    const y2 = y + (rand() - 0.5) * (h * 0.33);
    const cy1 = rand() * h;
    const cy2 = rand() * h;
    out += `<path d="M -40 ${y.toFixed(0)} C ${(w * 0.25).toFixed(0)} ${cy1.toFixed(0)}, ${(w * 0.67).toFixed(0)} ${cy2.toFixed(0)}, ${(w + 40).toFixed(0)} ${y2.toFixed(0)}"
      fill="none" stroke="url(#foil)" stroke-width="${(0.6 + rand() * 1.6).toFixed(2)}"
      opacity="${(0.1 + rand() * 0.16).toFixed(2)}"/>`;
  }
  return out;
}

function sparkles(rand, w = 1200, h = 800) {
  let out = "";
  for (let i = 0; i < 7; i++) {
    const x = 80 + rand() * (w - 160);
    const y = 60 + rand() * (h - 120);
    const s = 6 + rand() * 16;
    out += `<path d="M ${x} ${y - s} Q ${x + s * 0.16} ${y - s * 0.16} ${x + s} ${y}
      Q ${x + s * 0.16} ${y + s * 0.16} ${x} ${y + s}
      Q ${x - s * 0.16} ${y + s * 0.16} ${x - s} ${y}
      Q ${x - s * 0.16} ${y - s * 0.16} ${x} ${y - s} Z"
      fill="#F5E6A8" opacity="${(0.25 + rand() * 0.5).toFixed(2)}"/>`;
  }
  return out;
}

// Greedy wrap so long module names still sit as balanced gold caps.
function wrapTitle(title, maxChars) {
  const words = title.toUpperCase().split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    if (!line) line = word;
    else if ((line + " " + word).length <= maxChars) line += " " + word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function titleBlock(title, { cx, baseline, maxChars, sizes }) {
  const lines = wrapTitle(title, maxChars);
  const size = sizes[Math.min(lines.length, sizes.length) - 1];
  const lead = size * 1.18;
  const top = baseline - ((lines.length - 1) * lead) / 2;

  return lines
    .map(
      (line, i) =>
        `<text x="${cx}" y="${(top + i * lead).toFixed(0)}" text-anchor="middle" fill="url(#foil)"
           font-family="${SERIF}" font-size="${size}" font-weight="700"
           letter-spacing="${(size * 0.09).toFixed(1)}">${escapeXml(line)}</text>`
    )
    .join("");
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

// The infinity mark, drawn small as a crest above the lettering.
function crest(cx, y, width) {
  const path =
    "M 10,50 C 10,25 35,25 50,50 C 65,75 90,75 90,50 C 90,25 65,25 50,50 C 35,75 10,75 10,50 Z";
  return `<g transform="translate(${cx - width / 2} ${y}) scale(${(width / 100).toFixed(3)})">
    <path d="${path}" fill="none" stroke="url(#foil)" stroke-width="5"/>
  </g>`;
}

// Two canvases, because one aspect can't serve both a portrait-ish card
// and a wide banner without cropping the lettering off its own artwork.
const SHAPES = {
  card: {
    w: 1200, h: 800,
    geo: { scale: 1, dx: 0, dy: 0 },
    crest: { y: 150, width: 175 },
    rule: { y: 560, x1: 300, x2: 900 },
    title: { baseline: 660, maxChars: 16, sizes: [92, 74, 58] },
  },
  banner: {
    w: 1800, h: 620,
    geo: { scale: 0.62, dx: 900 - 600 * 0.62, dy: 250 - 380 * 0.62 },
    crest: { y: 46, width: 130 },
    rule: { y: 452, x1: 560, x2: 1240 },
    title: { baseline: 546, maxChars: 26, sizes: [86, 66, 52] },
  },
};

/**
 * Key art for a module, as a data URI suitable for background-image.
 * `index` picks the geometry motif and seeds the marble so each module
 * looks distinct but unmistakably from the same set.
 */
export function moduleArt(module, index = 0, shapeName = "card") {
  const rand = seeded(index + 1);
  const motif = MOTIFS[module.motif] || MOTIFS[MOTIF_ORDER[index % MOTIF_ORDER.length]];
  const shape = SHAPES[shapeName] || SHAPES.card;
  const { w, h } = shape;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="foil" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#F7EBBE"/>
      <stop offset="0.28" stop-color="#E3C77A"/>
      <stop offset="0.55" stop-color="#C9A24B"/>
      <stop offset="0.78" stop-color="#8C6E2F"/>
      <stop offset="1" stop-color="#E3C77A"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.44" r="0.62">
      <stop offset="0" stop-color="#C9A24B" stop-opacity="0.4"/>
      <stop offset="0.6" stop-color="#C9A24B" stop-opacity="0.1"/>
      <stop offset="1" stop-color="#C9A24B" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.85"/>
    </radialGradient>
    <style>
      .geo { fill: none; stroke: url(#foil); stroke-width: 2.2; opacity: 0.62; }
      .geo.faint { opacity: 0.26; stroke-width: 1.4; }
      .geo.solid { fill: url(#foil); stroke: none; opacity: 0.9; }
      .geo.solid-stroke { stroke-width: 3.4; opacity: 0.85; }
    </style>
  </defs>

  <rect width="${w}" height="${h}" fill="#08080A"/>
  ${marbleVeins(rand, w, h)}
  <rect width="${w}" height="${h}" fill="url(#halo)"/>
  <g transform="translate(${shape.geo.dx} ${shape.geo.dy}) scale(${shape.geo.scale})">${motif()}</g>
  ${sparkles(rand, w, h)}
  ${crest(w / 2, shape.crest.y, shape.crest.width)}

  <line x1="${shape.rule.x1}" y1="${shape.rule.y}" x2="${shape.rule.x2}" y2="${shape.rule.y}"
        stroke="url(#foil)" stroke-width="1.4" opacity="0.55"/>
  <rect x="${w / 2 - 6}" y="${shape.rule.y - 6}" width="12" height="12"
        transform="rotate(45 ${w / 2} ${shape.rule.y})" fill="url(#foil)" opacity="0.9"/>

  ${titleBlock(module.title, { cx: w / 2, ...shape.title })}
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " "))}`;
}

// Modules can still ship a real image; the generator is the fallback.
export function artFor(module, index, shape = "card") {
  return module.image || moduleArt(module, index, shape);
}
