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

// Marble is built in three passes: a wide blurred bloom, the vein itself,
// then hairline branches splitting off it. One pass alone reads as a
// scribble; three read as stone.
function marbleVeins(rand, w = 1200, h = 800) {
  let out = "";

  for (let i = 0; i < 7; i++) {
    const y = rand() * h;
    const y2 = y + (rand() - 0.5) * (h * 0.36);
    const cy1 = rand() * h;
    const cy2 = rand() * h;
    const d = `M -40 ${y.toFixed(0)} C ${(w * 0.25).toFixed(0)} ${cy1.toFixed(0)}, ${(w * 0.67).toFixed(0)} ${cy2.toFixed(0)}, ${(w + 40).toFixed(0)} ${y2.toFixed(0)}`;
    const weight = 0.5 + rand() * 1.8;

    // bloom under the vein
    out += `<path d="${d}" fill="none" stroke="#C9A24B" stroke-width="${(weight * 5).toFixed(1)}"
      opacity="${(0.05 + rand() * 0.06).toFixed(3)}" filter="url(#softGlow)"/>`;
    // the vein
    out += `<path d="${d}" fill="none" stroke="url(#foil)" stroke-width="${weight.toFixed(2)}"
      opacity="${(0.16 + rand() * 0.2).toFixed(2)}"/>`;

    // branches peeling off it
    for (let b = 0; b < 2; b++) {
      const bx = w * (0.2 + rand() * 0.6);
      const by = y + (y2 - y) * ((bx + 40) / (w + 80));
      const len = w * (0.08 + rand() * 0.16);
      const drop = (rand() - 0.5) * h * 0.2;
      out += `<path d="M ${bx.toFixed(0)} ${by.toFixed(0)} q ${(len / 2).toFixed(0)} ${(drop / 2).toFixed(0)} ${len.toFixed(0)} ${drop.toFixed(0)}"
        fill="none" stroke="url(#foil)" stroke-width="${(weight * 0.4).toFixed(2)}"
        opacity="${(0.08 + rand() * 0.12).toFixed(2)}"/>`;
    }
  }
  return out;
}

// Each spark is a four-point flare with long thin rays and a bloom behind
// it, rather than a solid diamond.
function sparkles(rand, w = 1200, h = 800) {
  let out = "";
  for (let i = 0; i < 11; i++) {
    const x = 70 + rand() * (w - 140);
    const y = 50 + rand() * (h - 100);
    const s = 5 + rand() * 18;
    const o = 0.3 + rand() * 0.55;
    const waist = s * 0.11;

    out += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(s * 1.5).toFixed(1)}"
      fill="#E3C77A" opacity="${(o * 0.28).toFixed(2)}" filter="url(#softGlow)"/>`;
    out += `<path d="M ${x} ${y - s} Q ${x + waist} ${y - waist} ${x + s} ${y}
      Q ${x + waist} ${y + waist} ${x} ${y + s}
      Q ${x - waist} ${y + waist} ${x - s} ${y}
      Q ${x - waist} ${y - waist} ${x} ${y - s} Z"
      fill="#FDF6DC" opacity="${o.toFixed(2)}"/>`;
    // the long cross ray
    out += `<path d="M ${x} ${(y - s * 2.1).toFixed(1)} L ${x} ${(y + s * 2.1).toFixed(1)}
      M ${(x - s * 2.1).toFixed(1)} ${y} L ${(x + s * 2.1).toFixed(1)} ${y}"
      stroke="#F7EBBE" stroke-width="0.7" opacity="${(o * 0.5).toFixed(2)}"/>`;
  }
  return out;
}

// An engraved double rule with corner diamonds, like the plate edge on the
// brand art.
function ornateFrame(w, h) {
  const m = Math.round(Math.min(w, h) * 0.045);
  const m2 = m + Math.round(Math.min(w, h) * 0.016);
  const corner = (cx, cy) =>
    `<rect x="${cx - 5}" y="${cy - 5}" width="10" height="10" transform="rotate(45 ${cx} ${cy})"
       fill="url(#foil)" opacity="0.75"/>`;

  return `
    <rect x="${m}" y="${m}" width="${w - m * 2}" height="${h - m * 2}"
      fill="none" stroke="url(#foil)" stroke-width="1.5" opacity="0.4"/>
    <rect x="${m2}" y="${m2}" width="${w - m2 * 2}" height="${h - m2 * 2}"
      fill="none" stroke="url(#foil)" stroke-width="0.7" opacity="0.22"/>
    ${corner(m, m)}${corner(w - m, m)}${corner(m, h - m)}${corner(w - m, h - m)}`;
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

  // Three passes per line — a dropped shadow, the foil body, and a pale
  // highlight offset up — which is what makes the type look stamped
  // rather than filled.
  return lines
    .map((line, i) => {
      const y = top + i * lead;
      const common = `text-anchor="middle" font-family="${SERIF}" font-size="${size}" font-weight="700" letter-spacing="${(size * 0.09).toFixed(1)}"`;
      const text = escapeXml(line);
      return `
        <text x="${cx}" y="${(y + size * 0.045).toFixed(1)}" ${common} fill="url(#foilDeep)" opacity="0.9">${text}</text>
        <text x="${cx}" y="${y.toFixed(0)}" ${common} fill="url(#foil)" filter="url(#glow)">${text}</text>
        <text x="${cx}" y="${(y - size * 0.022).toFixed(1)}" ${common} fill="#FDF6DC" opacity="0.3">${text}</text>`;
    })
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
    <!-- Foil has a hot edge, a body, a shadow and a second highlight, so
         it reads as metal catching light rather than a flat gold. -->
    <linearGradient id="foil" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#FDF6DC"/>
      <stop offset="0.14" stop-color="#F7EBBE"/>
      <stop offset="0.3" stop-color="#E3C77A"/>
      <stop offset="0.47" stop-color="#C9A24B"/>
      <stop offset="0.62" stop-color="#7C5F26"/>
      <stop offset="0.78" stop-color="#C9A24B"/>
      <stop offset="0.92" stop-color="#F3E3B2"/>
      <stop offset="1" stop-color="#9A7833"/>
    </linearGradient>
    <linearGradient id="foilDeep" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#6B5220"/>
      <stop offset="1" stop-color="#2A2110"/>
    </linearGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="14" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    <!-- Fine tooth over the whole plate so it isn't a flat vector fill -->
    <filter id="tooth" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
    </filter>
    <radialGradient id="halo" cx="0.5" cy="0.44" r="0.62">
      <stop offset="0" stop-color="#C9A24B" stop-opacity="0.4"/>
      <stop offset="0.6" stop-color="#C9A24B" stop-opacity="0.1"/>
      <stop offset="1" stop-color="#C9A24B" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="stone" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#17171C"/>
      <stop offset="0.45" stop-color="#0C0C0F"/>
      <stop offset="1" stop-color="#141419"/>
    </linearGradient>
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
  <rect width="${w}" height="${h}" fill="url(#stone)"/>
  ${marbleVeins(rand, w, h)}
  <rect width="${w}" height="${h}" fill="url(#halo)"/>
  <g transform="translate(${shape.geo.dx} ${shape.geo.dy}) scale(${shape.geo.scale})">${motif()}</g>
  ${ornateFrame(w, h)}
  ${sparkles(rand, w, h)}
  <g filter="url(#glow)">${crest(w / 2, shape.crest.y, shape.crest.width)}</g>

  <line x1="${shape.rule.x1}" y1="${shape.rule.y}" x2="${shape.rule.x2}" y2="${shape.rule.y}"
        stroke="url(#foil)" stroke-width="1.4" opacity="0.55"/>
  <rect x="${w / 2 - 6}" y="${shape.rule.y - 6}" width="12" height="12"
        transform="rotate(45 ${w / 2} ${shape.rule.y})" fill="url(#foil)" opacity="0.9"/>

  ${titleBlock(module.title, { cx: w / 2, ...shape.title })}
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
  <rect width="${w}" height="${h}" filter="url(#tooth)" opacity="0.055"/>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " "))}`;
}

// Modules can still ship a real image; the generator is the fallback.
export function artFor(module, index, shape = "card") {
  return module.image || moduleArt(module, index, shape);
}
