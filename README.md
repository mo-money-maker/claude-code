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
  data/curriculum.js      Your real content: modules, submodules, rituals
  assets/modules/*.svg     Module preview art (also the module background)
  assets/video/*.webm       Generated placeholder lesson clips
  js/api.js                  fetch wrapper for the backend
  js/state.js                 In-memory state, synced to the server
  js/router.js                 Hash router (#/, #/m/:id, #/w/:mid/:sid, #/r/:id)
  js/ui.js                      Shared DOM helpers (status ring, bars, backdrop)
  js/views/home.js               Goals, counters, module shelf, rituals
  js/views/module.js              Lesson list over the module's picture
  js/views/player.js               Video + autonomous completion
  js/auth.js                        Wires up login.html
  js/main.js                         Entry point: auth gate, routes, boot

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
    id: "mod-foundations",       // must stay stable — used as the
    title: "Foundations",        // storage key for that item's watched state
    submodules: [
      { id: "sub-welcome", title: "Welcome & Orientation", videoUrl: "" },
    ],
  },
];
```

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
- **Module shelf**: horizontally scrollable, scroll-snapped module cards
  with preview art. A plain vertical mouse wheel scrolls it sideways.
- **Module picture as background**: entering a module fades its preview art
  in behind the lesson list, under a dark wash so text stays readable.
- **Resume**: whichever lesson you got furthest into without finishing
  surfaces as a Resume button, and the player picks up where you left off.
- Daily Rituals (AM/PM) are tracked per calendar date, so they reset each
  morning.
- Progress is saved to the server (debounced), and flushed with
  `navigator.sendBeacon` on page unload so a half-watched position isn't
  lost when the tab closes.

## Placeholder media

`public/assets/video/*.webm` are generated stand-in clips and
`public/assets/modules/*.svg` is generated abstract art, both there so the
app is usable before you have real content. Swap the `videoUrl` and
`image` values in `data/curriculum.js` for your real files.

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
- **Autoplay the next lesson** when one completes, so a module can be
  watched straight through.
