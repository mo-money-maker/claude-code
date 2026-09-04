// Your real curriculum content lives here. Edit freely — the UI in js/*
// never needs to change when this data changes.
//
// modules: the left-rail outline. Each module has an id, a title, and a
// list of submodules (id, title, optional videoUrl).
//
// rituals: the repeating AM/PM items shown in "Daily Rituals". Completion
// is tracked per calendar day (see js/state.js), so the same ritual resets
// automatically each morning.

export const modules = [
  {
    id: "mod-foundations",
    title: "Foundations of Coaching",
    submodules: [
      { id: "sub-welcome", title: "Welcome & Orientation", videoUrl: "" },
      { id: "sub-philosophy", title: "Your Coaching Philosophy", videoUrl: "" },
      { id: "sub-practice-setup", title: "Setting Up Your Practice", videoUrl: "" },
    ],
  },
  {
    id: "mod-client-relationships",
    title: "Client Relationships",
    submodules: [
      { id: "sub-discovery-calls", title: "Running Discovery Calls", videoUrl: "" },
      { id: "sub-onboarding", title: "Client Onboarding", videoUrl: "" },
      { id: "sub-difficult-conversations", title: "Navigating Difficult Conversations", videoUrl: "" },
      { id: "sub-retention", title: "Retention & Renewals", videoUrl: "" },
    ],
  },
  {
    id: "mod-frameworks",
    title: "Coaching Frameworks",
    submodules: [
      { id: "sub-goal-setting", title: "Goal-Setting Frameworks", videoUrl: "" },
      { id: "sub-accountability", title: "Building Accountability Systems", videoUrl: "" },
      { id: "sub-feedback", title: "Giving Effective Feedback", videoUrl: "" },
    ],
  },
  {
    id: "mod-business",
    title: "Growing Your Business",
    submodules: [
      { id: "sub-pricing", title: "Pricing Your Services", videoUrl: "" },
      { id: "sub-marketing", title: "Marketing Without Burning Out", videoUrl: "" },
    ],
  },
];

export const rituals = [
  {
    id: "ritual-am",
    period: "AM",
    title: "Morning Mindset",
    subtitle: "Ground yourself before your first session",
    videoUrl: "",
  },
  {
    id: "ritual-pm",
    period: "PM",
    title: "Evening Reflection",
    subtitle: "Review the day, note what to carry forward",
    videoUrl: "",
  },
];
