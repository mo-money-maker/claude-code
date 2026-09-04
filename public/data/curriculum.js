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
// videoUrl values for your real files or hosted URLs.

export const modules = [
  {
    id: "mod-foundations",
    title: "Foundations of Coaching",
    blurb: "Set your footing before you take on a single client.",
    image: "assets/modules/foundations.svg",
    submodules: [
      { id: "sub-welcome", title: "Welcome & Orientation", videoUrl: "assets/video/lesson-a.webm" },
      { id: "sub-philosophy", title: "Your Coaching Philosophy", videoUrl: "assets/video/lesson-b.webm" },
      { id: "sub-practice-setup", title: "Setting Up Your Practice", videoUrl: "assets/video/lesson-c.webm" },
    ],
  },
  {
    id: "mod-client-relationships",
    title: "Client Relationships",
    blurb: "Win trust early, keep it through the hard conversations.",
    image: "assets/modules/relationships.svg",
    submodules: [
      { id: "sub-discovery-calls", title: "Running Discovery Calls", videoUrl: "assets/video/lesson-b.webm" },
      { id: "sub-onboarding", title: "Client Onboarding", videoUrl: "assets/video/lesson-c.webm" },
      { id: "sub-difficult-conversations", title: "Navigating Difficult Conversations", videoUrl: "assets/video/lesson-d.webm" },
      { id: "sub-retention", title: "Retention & Renewals", videoUrl: "assets/video/lesson-a.webm" },
    ],
  },
  {
    id: "mod-frameworks",
    title: "Coaching Frameworks",
    blurb: "The repeatable structures behind every good session.",
    image: "assets/modules/frameworks.svg",
    submodules: [
      { id: "sub-goal-setting", title: "Goal-Setting Frameworks", videoUrl: "assets/video/lesson-c.webm" },
      { id: "sub-accountability", title: "Building Accountability Systems", videoUrl: "assets/video/lesson-d.webm" },
      { id: "sub-feedback", title: "Giving Effective Feedback", videoUrl: "assets/video/lesson-a.webm" },
    ],
  },
  {
    id: "mod-business",
    title: "Growing Your Business",
    blurb: "Charge properly and market without burning out.",
    image: "assets/modules/business.svg",
    submodules: [
      { id: "sub-pricing", title: "Pricing Your Services", videoUrl: "assets/video/lesson-d.webm" },
      { id: "sub-marketing", title: "Marketing Without Burning Out", videoUrl: "assets/video/lesson-b.webm" },
    ],
  },
];

export const rituals = [
  {
    id: "ritual-am",
    period: "AM",
    title: "Morning Mindset",
    subtitle: "Ground yourself before your first session",
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
