# Curriculum UI

Plain HTML/CSS/JS — no build step, no framework. Open `index.html` through
any static file server (ES modules don't load over `file://`):

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html          Page shell: left rail + main panel markup
css/styles.css       Design tokens + all styling
data/curriculum.js   Your real content: modules, submodules, rituals
js/state.js          Watched status, ritual completion, collapse state
                      (persisted to localStorage)
js/render.js          Builds the DOM from data/ + state.js on every change
js/main.js            Entry point
```

## Editing content

Edit `data/curriculum.js` only — add/remove/reorder modules, submodules,
and rituals there. The UI code never needs to change for content updates.

```js
export const modules = [
  {
    id: "mod-foundations",       // must stay stable — used as the
    title: "Foundations",        // localStorage key for watched state
    submodules: [
      { id: "sub-welcome", title: "Welcome & Orientation", videoUrl: "" },
    ],
  },
];
```

Keep `id`s stable once a real user has interacted with the app — they're
the localStorage keys for watched/progress state, so changing an id resets
that item's status.

## Behavior implemented

- Left rail: collapsible module → submodule outline, click a module header
  to collapse/expand.
- Watch ring next to each submodule: click to toggle watched (hollow →
  filled gold). Toggling updates that module's live `n/total` count.
- Clicking a submodule's title marks it "opened" and surfaces it under
  Continue Watching (most recently opened, unwatched items first).
- Daily Rituals (AM/PM) cards: click to toggle today's completion. State is
  keyed by calendar date, so it resets automatically each day.
- All watched/opened/ritual state persists to `localStorage` and survives
  reloads.

## Extending

Good next steps, in roughly increasing order of effort:

- **Real video player**: `videoUrl` fields already exist on submodules and
  rituals — wire a click on `.continue-resume` / ritual cards to open a
  player (modal, route, or inline `<video>`) and call `markOpened` /
  `toggleWatched` from the player's `onEnded`/progress events instead of
  from the row click.
- **Server-backed persistence**: swap the body of `state.js`'s `persist()`
  and the initial `loadRaw()` for `fetch` calls to your backend, keeping
  every other file untouched — `render.js` and `data/curriculum.js` don't
  know or care where state comes from.
- **Multiple users**: once state is server-backed, key it by user id
  (e.g. `/api/users/:id/progress`) instead of a single localStorage blob.
- **Search/filter in the rail**: add a text input above `#rail-modules`
  that filters the `modules` array before passing it to the render
  functions.
