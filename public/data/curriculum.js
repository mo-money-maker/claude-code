// Your real curriculum content lives here. Edit freely — the UI code in
// js/ never needs to change when this data changes.
//
// modules:    the scrollable module cards on the home screen. `image` is
//             the preview picture, which also becomes the background once
//             you're inside that module.
// submodules: individual lessons. `videoUrl` is what the player plays;
//             finishing it marks the lesson complete automatically.
// rituals:    the repeating AM/PM items. Completion is tracked per
//             calendar day, so they reset each morning.
//
// The videos under assets/video are generated placeholders — swap the
// videoUrl values for your real files or hosted URLs. Lesson titles below
// are placeholders too; rename them to your actual lessons.

export const modules = [
  {
    id: "mod-more-life-1",
    title: "More Life Mastery 1.0",
    blurb: "The foundation — where you are, and the standard you're moving to.",
    image: "assets/modules/more-life-1.svg",
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
    image: "assets/modules/more-life-2.svg",
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
    image: "assets/modules/hypnosis-resistance.svg",
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
    image: "assets/modules/state-anchor.svg",
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
    image: "assets/modules/success-system.svg",
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
    image: "assets/modules/behavioural-profiling.svg",
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
    image: "assets/modules/vision.svg",
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
