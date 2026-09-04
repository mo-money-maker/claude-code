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
  index.html            App shell: left rail + main panel markup
  login.html             Sign in / create account screen
  css/styles.css          Design tokens + all styling
  data/curriculum.js      Your real content: modules, submodules, rituals
  js/api.js                fetch wrapper for the backend
  js/state.js               In-memory app state, synced to the server
  js/render.js               Builds the DOM from data/ + state.js
  js/auth.js                 Wires up login.html
  js/main.js                  Entry point for index.html: auth gate + boot

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

- **Accounts**: email/password signup and login (bcrypt-hashed passwords,
  server-side session tokens in an httpOnly cookie — see
  `server/routes/auth.js`). Each user's watched/opened/ritual state is
  private to their account, stored in `server/app.db`.
- Left rail: collapsible module → submodule outline. Clicking a module
  header "zooms" it open/closed (grid-rows + scale CSS transition).
- Watch ring next to each submodule: click to toggle watched (hollow →
  filled gold, with a slow idle glow once watched). Toggling updates that
  module's live `n/total` count.
- Clicking a submodule's title marks it "opened" and surfaces it under
  Continue Watching (most recently opened, unwatched items first).
- Daily Rituals (AM/PM) cards: click to toggle today's completion. State is
  keyed by calendar date, so it resets automatically each day.
- All watched/opened/ritual state is saved to the server on every change
  and reloaded from there on boot — it follows the signed-in user, not the
  browser.

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

- **Real video player**: `videoUrl` fields already exist on submodules and
  rituals — wire a click on `.continue-resume` / ritual cards to open a
  player (modal, route, or inline `<video>`) and call `markOpened` /
  `toggleWatched` from the player's `onEnded`/progress events instead of
  from the row click.
- **Password reset / email verification**: needs an email-sending
  provider; the `users` table already has room for a `reset_token` /
  `verified_at` column if you want to add this.
- **Coach vs. client roles**: add a `role` column to `users` and a simple
  admin view for editing curriculum content through the UI instead of
  hand-editing `data/curriculum.js`.
- **Search/filter in the rail**: add a text input above `#rail-modules`
  that filters the `modules` array before passing it to the render
  functions.
