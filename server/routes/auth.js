// Signup / login / logout / me, backed by a signed-nothing random session
// token (opaque, stored server-side in `sessions`) rather than a JWT — it
// can be revoked instantly (delete the row) and carries no client-trusted
// claims.

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "../db.js";

const SESSION_DAYS = 30;
const COOKIE_NAME = "sid";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_STATE = JSON.stringify({ watched: {}, lastOpened: {}, ritualCompletion: {}, collapsed: {} });

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function setSessionCookie(res, token) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  // `Secure` is omitted so this also works over plain http in local/dev
  // use; add it back once the app is served over https.
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`);
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, userId, expiresAt);
  return token;
}

export function getSessionUser(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  const session = db.prepare("SELECT * FROM sessions WHERE token = ?").get(token);
  if (!session || session.expires_at < Date.now()) return null;
  return db.prepare("SELECT id, email, display_name FROM users WHERE id = ?").get(session.user_id) || null;
}

export function requireAuth(req, res, next) {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Not signed in" });
  req.user = user;
  next();
}

function publicUser(u) {
  return { id: u.id, email: u.email, displayName: u.display_name };
}

export function signup(req, res) {
  const { email, password, displayName } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Enter a valid email" });
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (!displayName || !displayName.trim()) return res.status(400).json({ error: "Enter a display name" });

  const normalizedEmail = email.trim().toLowerCase();
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail)) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?)")
    .run(normalizedEmail, hash, displayName.trim(), Date.now());

  const userId = Number(info.lastInsertRowid);
  db.prepare("INSERT INTO user_state (user_id, state_json, updated_at) VALUES (?, ?, ?)").run(
    userId,
    EMPTY_STATE,
    Date.now()
  );

  setSessionCookie(res, createSession(userId));
  res.json(publicUser({ id: userId, email: normalizedEmail, display_name: displayName.trim() }));
}

export function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Enter your email and password" });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  setSessionCookie(res, createSession(user.id));
  res.json(publicUser(user));
}

export function logout(req, res) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  clearSessionCookie(res);
  res.json({ ok: true });
}

export function me(req, res) {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Not signed in" });
  res.json(publicUser(user));
}
