// Per-user progress, stored as one JSON blob — the same shape the
// frontend keeps in memory (watched / progress / ritualCompletion /
// activity), keyed by req.user.id (set by requireAuth).

import { db } from "../db.js";

const EMPTY_STATE = { watched: {}, progress: {}, ritualCompletion: {}, activity: {} };

export function getState(req, res) {
  const row = db.prepare("SELECT state_json FROM user_state WHERE user_id = ?").get(req.user.id);
  res.json(row ? JSON.parse(row.state_json) : EMPTY_STATE);
}

export function putState(req, res) {
  const state = req.body || {};
  db.prepare(
    `INSERT INTO user_state (user_id, state_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`
  ).run(req.user.id, JSON.stringify(state), Date.now());
  res.json({ ok: true });
}
