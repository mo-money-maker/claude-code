// Your real curriculum content lives here. Edit freely — the UI code in
// js/ never needs to change when this data changes.
//
// modules:    the scrollable module cards on the home screen. `image` is
//             the preview picture, which also becomes the background once
//             you're inside that module. Leave `image` off and key art is
//             generated from the title + `motif` (see js/art.js), so a new
//             module is on-brand without anyone drawing anything. Set
//             `image: "assets/..."` to use your own file instead.
// submodules: individual lessons. `videoUrl` is what the player plays;
//             finishing it marks the lesson complete automatically.
// rituals:    the repeating AM/PM items. Completion is tracked per
//             calendar day, so they reset each morning.
//
// mantras:   one line surfaces per day on the home screen, chosen by the
//             date, so the app opens with a different intention each
//             morning without anyone scheduling it.
//
// The videos under assets/video are generated placeholders — swap the
// videoUrl values for your real files or hosted URLs. Lesson titles below
// are placeholders too; rename them to your actual lessons.

export const modules = [
  {
    id: "mod-more-life-1",
    title: "More Life Mastery 1.0",
    blurb: "The foundation — where you are, and the standard you're moving to.",
    motif: "ascent",
    kicker: "Begin here",
    submodules: [
      { id: "mlm1-framework", title: "The More Life Framework", videoUrl: "assets/video/lesson-a.webm" },
      { id: "mlm1-audit", title: "Auditing Where You Are", videoUrl: "assets/video/lesson-b.webm" },
      { id: "mlm1-standard", title: "Setting the Standard", videoUrl: "assets/video/lesson-c.webm" },
      { id: "mlm1-non-negotiables", title: "Daily Non-Negotiables", videoUrl: "assets/video/lesson-d.webm" },
    ],
  },
  {
    id: "mod-more-life-2",
    title: "More Life Mastery 2.0",
    blurb: "Compounding the standard until it becomes who you are.",
    motif: "seed",
    kicker: "Compound the standard",
    submodules: [
      { id: "mlm2-compounding", title: "Compounding Your Standards", videoUrl: "assets/video/lesson-b.webm" },
      { id: "mlm2-identity", title: "Identity-Level Change", videoUrl: "assets/video/lesson-c.webm" },
      { id: "mlm2-ceiling", title: "Removing the Ceiling", videoUrl: "assets/video/lesson-d.webm" },
    ],
  },
  {
    id: "mod-hypnosis-resistance",
    title: "Hypnosis (Resistance Removal)",
    blurb: "Clear what's been quietly holding the work back.",
    motif: "rings",
    kicker: "Integrate what holds you back",
    submodules: [
      { id: "hyp-understanding", title: "Understanding Resistance", videoUrl: "assets/video/lesson-a.webm" },
      { id: "hyp-protocol", title: "The Removal Protocol", videoUrl: "assets/video/lesson-b.webm" },
      { id: "hyp-objections", title: "Working With Objections", videoUrl: "assets/video/lesson-c.webm" },
      { id: "hyp-lock-in", title: "Locking In the Shift", videoUrl: "assets/video/lesson-d.webm" },
    ],
  },
  {
    id: "mod-state-anchor",
    title: "State Anchor Hypnosis Tracks",
    blurb: "Trainable states you can reach on demand.",
    motif: "wave",
    kicker: "State creates reality",
    submodules: [
      { id: "anchor-how", title: "How Anchoring Works", videoUrl: "assets/video/lesson-c.webm" },
      { id: "anchor-first", title: "Building Your First Anchor", videoUrl: "assets/video/lesson-d.webm" },
      { id: "anchor-confidence", title: "Confidence Anchor Track", videoUrl: "assets/video/lesson-a.webm" },
      { id: "anchor-calm", title: "Calm Under Pressure Track", videoUrl: "assets/video/lesson-b.webm" },
    ],
  },
  {
    id: "mod-success-system",
    title: "The Success System",
    blurb: "The repeatable machine behind consistent results.",
    motif: "hexagram",
    kicker: "The machine behind results",
    submodules: [
      { id: "sys-overview", title: "The System Overview", videoUrl: "assets/video/lesson-d.webm" },
      { id: "sys-feedback", title: "Inputs, Outputs & Feedback", videoUrl: "assets/video/lesson-a.webm" },
      { id: "sys-review", title: "Weekly Review Cadence", videoUrl: "assets/video/lesson-b.webm" },
      { id: "sys-scaling", title: "Scaling What Works", videoUrl: "assets/video/lesson-c.webm" },
    ],
  },
  {
    id: "mod-behavioural-profiling",
    title: "Behavioural Profiling & Influence Mastery",
    blurb: "Read people accurately, then move them honestly.",
    motif: "vesica",
    kicker: "Read clearly, move honestly",
    submodules: [
      { id: "bp-reading", title: "Reading People Fast", videoUrl: "assets/video/lesson-b.webm" },
      { id: "bp-profiles", title: "The Four Profiles", videoUrl: "assets/video/lesson-c.webm" },
      { id: "bp-matching", title: "Matching & Pacing", videoUrl: "assets/video/lesson-d.webm" },
      { id: "bp-influence", title: "Ethical Influence", videoUrl: "assets/video/lesson-a.webm" },
    ],
  },
  {
    id: "mod-vision",
    title: "Build and Connect to the Vision",
    blurb: "Make the vision vivid enough to pull you forward daily.",
    motif: "eye",
    kicker: "See it before you live it",
    submodules: [
      { id: "vis-drafting", title: "Drafting the Vision", videoUrl: "assets/video/lesson-c.webm" },
      { id: "vis-vivid", title: "Making It Vivid", videoUrl: "assets/video/lesson-d.webm" },
      { id: "vis-connecting", title: "Connecting Daily", videoUrl: "assets/video/lesson-a.webm" },
      { id: "vis-living", title: "Living From the Vision", videoUrl: "assets/video/lesson-b.webm" },
    ],
  },
];

export const rituals = [
  {
    id: "ritual-am",
    period: "AM",
    title: "Morning Mindset",
    subtitle: "Set the state before the day sets it for you",
    videoUrl: "assets/video/lesson-a.webm",
  },
  {
    id: "ritual-pm",
    period: "PM",
    title: "Evening Reflection",
    subtitle: "Review the day, note what to carry forward",
    videoUrl: "assets/video/lesson-d.webm",
  },
];

// Surfaced one per day on the home screen, picked by the date.
export const mantras = [
  "State creates reality.",
  "The standard you keep in private becomes the life you live in public.",
  "Integrate the parts of you holding you back.",
  "You do not rise to the vision; you fall to your practice.",
  "Attention is the currency. Spend it deliberately.",
  "Consistency is the whole secret, and it is not a secret.",
  "Build the state first — the action follows it.",
];
