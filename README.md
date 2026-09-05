# Curriculum UI

A small Node/Express backend (accounts + per-user progress) in front of a
plain HTML/CSS/JS frontend — no framework, no bundler on the client side.

## Running it

```
cd server
npm install
npm start
# then visit http://localhost:3000
```

The server serves the frontend (`public/`) and the API (`/api/*`) from one
process, so this is the only thing you need to run. The database is a
SQLite file at `server/app.db`, created automatically on first run via
Node's built-in `node:sqlite` — no native build tools, no separate DB
server.

Visiting the app redirects to `login.html` until you sign in; use "Create
account" to make your first user.

## Structure

```
public/                Frontend — served as static files, no build step
  index.html            The whole app: one page, hash-routed views
  login.html             Sign in / create account screen
  css/styles.css          Design tokens + all styling
  data/curriculum.js      Your content: modules, lessons, rituals, mantras
  assets/video/*.webm      Generated placeholder lesson clips
  js/art.js                 Generates each module's gold key art
  js/motion.js               Scroll reveals, count-ups, headings, parallax
  js/transition.js            Shared-element zoom between row and hero
  js/api.js                   fetch wrapper for the backend
  js/state.js                  In-memory state, synced to the server
  js/router.js                  Hash router (#/, #/m/:id, #/w/:mid/:sid, #/r/:id)
  js/ui.js                       Shared DOM helpers (rings, bars, glyphs)
  js/views/home.js                Mantra, counters, goals, module rows, rituals
  js/views/module.js               Key-art hero + lesson list
  js/views/player.js                Video + autonomous completion
  js/auth.js                         Wires up login.html
  js/main.js                          Entry point: auth gate, routes, boot

server/                Backend
  server.js              Express app: mounts /api/* and serves public/
  db.js                    SQLite schema (users, sessions, user_state)
  routes/auth.js            Signup / login / logout / session handling
  routes/state.js            Get/save the signed-in user's progress
  app.db                     SQLite database file (gitignored, runtime only)
```

## Editing content

Edit `public/data/curriculum.js` only — add/remove/reorder modules,
submodules, and rituals there. The UI code never needs to change for
content updates.

```js
export const modules = [
  {
    id: "mod-more-life-1",           // must stay stable — it's the
    title: "More Life Mastery 1.0",  // storage key for progress
    blurb: "Shown on the row.",
    kicker: "Begin here",            // small gold line above the title
    motif: "ascent",                 // which sacred geometry the art uses
    submodules: [
      { id: "mlm1-framework", title: "The More Life Framework", videoUrl: "..." },
    ],
  },
];
```

No artwork needed — key art is generated from the title and motif. Add
`image: "assets/your-file.png"` to a module only when you want to override
it with your own.

Keep `id`s stable once real users have interacted with the app — they're
the keys progress is stored under, so changing an id resets that item's
status for everyone.

## Behavior implemented

- **One page**: home → module → player are hash-routed views, no reloads
  and no sidebar. The back link in each view walks you out.
- **Accounts**: email/password signup and login (bcrypt-hashed passwords,
  server-side session tokens in an httpOnly cookie — see
  `server/routes/auth.js`). Each user's progress is private to their
  account, stored in `server/app.db`.
- **Autonomous completion**: nothing is ticked by hand. The player reports
  playback position and an item completes itself once it passes
  `COMPLETE_AT` (90%, the usual LMS convention — trailing silence or
  credits shouldn't strand a lesson at 99%). The status rings are display
  only; they fill as you watch and go solid gold when done.
- **Goals and counters** on the home screen: day streak, lessons watched,
  rituals done today, plus a short goal list that ticks itself off as you
  go.
- **Streak accountability**: a streak you haven't defended today turns
  amber with a callout naming what's at stake. There is deliberately no
  freeze or grace day — miss a day and it really does reset to zero.
- **Weekly target you set yourself**: pick 3, 5, 7 or 10 lessons a week;
  progress counts lessons completed since Monday.
- **Autoplay the next lesson**: finishing a lesson raises an end card with
  the next one and an 8-second countdown (or "Play now" / "Stay here").
  The countdown is cancelled if you navigate away.
- **Module milestone**: finishing the last lesson in a module raises a
  celebration card with gold burst rings, your totals, and a jump into the
  next module.
- **The path**: modules are full-width rows — no sliders, no carousels —
  that rise into place as they reach the viewport.
- **Module key art as background**: entering a module fades its art in
  behind the lesson list, under a dark wash so text stays readable.
- **A mantra a day**: one line from `mantras` in the data file surfaces on
  the home screen, chosen by the date, so it changes overnight on its own.
- **Resume**: whichever lesson you got furthest into without finishing
  surfaces as a Resume button, and the player picks up where you left off.
- Daily Rituals (AM/PM) are tracked per calendar date, so they reset each
  morning.
- Progress is saved to the server (debounced), and flushed with
  `navigator.sendBeacon` on page unload so a half-watched position isn't
  lost when the tab closes.

## Design system

The look is gold foil on near-black: Cinzel for display type, Inter for
UI, and gold treated as a material (`--foil`) rather than a flat colour.
Frosted panels, a gold hairline along card tops, film grain in soft-light,
and a slowly turning seed-of-life behind everything.

**Module key art is generated, not drawn** (`js/art.js`). Each module gets
marble veining built in three passes (a blurred bloom, the vein, hairline
branches), a sacred-geometry motif, an engraved double frame with corner
diamonds, four-point flares with long rays, the glowing infinity crest,
and its title stamped in three passes — a dropped shadow, the foil body
and a pale highlight — so the type reads as embossed metal rather than
filled shapes. A turbulence pass over the whole plate keeps it from
looking like flat vector. All of it is seeded from the module's position,
so a given module always renders identically. Two canvases are produced — a card for rows and backdrops, a wide
banner for the module hero — so lettering is never cropped by its frame.
Add a module to `data/curriculum.js` and it is on-brand immediately; set
`image: "assets/..."` on a module to use your own artwork instead, and
`motif:` to pick the geometry (`ascent`, `seed`, `rings`, `wave`,
`hexagram`, `vesica`, `eye`).

## Motion

Every animation moves `transform` or `opacity` and nothing else, so none
of it can trigger layout. One easing curve — `cubic-bezier(0.16, 1, 0.3,
1)`, exposed as `--ease` — is used everywhere, which is what makes
separate pieces feel like one system. Micro-interactions run 200-350ms,
entrances 600-800ms.

- **Ambient**: a checkerboard in the palette's own tones drifting under a
  slow breathing aura, the seed-of-life turning behind it and drifting
  against the scroll (`startParallax`, rAF-throttled, writes a custom
  property consumed by a transform).
- **Arrival**: the page opens with the same enlarge-and-settle used by the
  hover preview, so first paint reads as opening rather than waiting.
- **Rows**: hovering lifts and scales a row while its blurb cross-fades to
  the lessons inside. Both layers are stacked in one box, so revealing
  detail never changes the row's height and nothing below it shifts.
- **Zoom** (`js/transition.js`): clicking a module flies its artwork into
  the hero and back out again on the way home. It's FLIP — measure, render,
  measure, animate the difference. The aspect changes on the way, so the
  ghost is two nested layers: an outer frame that takes the non-uniform
  scale and clips, and an inner image counter-scaled by exactly the
  inverse, which keeps the picture square while the window around it grows.
- **Menu**: absolutely positioned and animated with transform/opacity, so
  opening it never moves the bar underneath.

Scroll reveals carry a failsafe. An IntersectionObserver only reports what
it samples, so a jump-scroll can skip an element and leave it invisible
forever; a scroll/resize sweep reveals anything at or above the fold
regardless.

Everything collapses under `prefers-reduced-motion`: animations off,
transforms dropped, and state changes fall back to plain opacity.

## Placeholder media

`public/assets/video/*.webm` are generated stand-in clips so the app is
usable before you have real content. Swap the `videoUrl` values in
`data/curriculum.js` for your real files. Lesson titles are placeholders
too — the module names are yours, the lessons inside them are for you to
rename.

## Security notes for going further than local dev

- Session cookies are set without `Secure` so they also work over plain
  `http://localhost`. Add `Secure` back in `server/routes/auth.js` once
  this is served over `https`.
- `node:sqlite` is still an experimental Node API (stable enough here, but
  worth knowing) — swapping to `better-sqlite3` or Postgres later is a
  change confined to `server/db.js` and the two files under
  `server/routes/`; nothing in `public/` needs to change.
- There's no rate limiting on `/api/login` or `/api/signup` yet.

## Extending

Good next steps, in roughly increasing order of effort:

- **Real content**: replace the placeholder `videoUrl` / `image` values in
  `data/curriculum.js`. Hosted URLs work as-is; for a streaming provider
  (Mux, Vimeo, Cloudflare Stream) swap the `<video>` element in
  `js/views/player.js` for their embed and call `setProgress` /
  `completeItem` from that player's progress events instead.
- **Password reset / email verification**: needs an email-sending
  provider; add a `reset_token` / `verified_at` column to `users`.
- **Coach vs. client roles**: add a `role` column to `users` and an admin
  view for editing curriculum content through the UI instead of
  hand-editing `data/curriculum.js`.
- **Restrict forward-seeking** if you ever want completion to be
  unfakeable — right now the scrubber is free, so a lesson can be skipped
  to the end.
- **Notifications / email nudges** for a streak that's about to break;
  that's where streak mechanics get most of their pull, and it needs an
  email or push provider.
