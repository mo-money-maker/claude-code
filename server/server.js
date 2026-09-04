import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initDb } from "./db.js";
import { signup, login, logout, me, requireAuth } from "./routes/auth.js";
import { getState, putState } from "./routes/state.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const PORT = process.env.PORT || 3000;

initDb();

const app = express();
app.use(express.json());

app.post("/api/signup", signup);
app.post("/api/login", login);
app.post("/api/logout", logout);
app.get("/api/me", me);
app.get("/api/state", requireAuth, getState);
app.put("/api/state", requireAuth, putState);
// Same handler over POST so the client can use navigator.sendBeacon on
// page unload (beacons are POST-only).
app.post("/api/state", requireAuth, putState);

// Static frontend only — server/ (including the SQLite file) is never
// under this directory, so it can't be served by accident.
app.use(express.static(publicDir));

app.listen(PORT, () => {
  console.log(`Curriculum UI running at http://localhost:${PORT}`);
});
