import * as api from "./api.js";

const form = document.getElementById("auth-form");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const nameField = document.getElementById("field-name");
const errorEl = document.getElementById("auth-error");
const submitBtn = form.querySelector(".auth-submit");

let mode = "login";

// Already signed in (existing session cookie) — skip the form entirely.
api.me().then(() => {
  window.location.href = "index.html";
}).catch(() => {});

function setMode(next) {
  mode = next;
  tabLogin.classList.toggle("is-active", mode === "login");
  tabSignup.classList.toggle("is-active", mode === "signup");
  nameField.hidden = mode !== "signup";
  nameField.querySelector("input").required = mode === "signup";
  submitBtn.textContent = mode === "login" ? "Sign in" : "Create account";
  errorEl.hidden = true;
}

tabLogin.addEventListener("click", () => setMode("login"));
tabSignup.addEventListener("click", () => setMode("signup"));

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const data = new FormData(form);
  const email = data.get("email");
  const password = data.get("password");
  const displayName = data.get("displayName");

  submitBtn.disabled = true;
  try {
    if (mode === "login") {
      await api.login(email, password);
    } else {
      await api.signup(email, password, displayName);
    }
    window.location.href = "index.html";
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  } finally {
    submitBtn.disabled = false;
  }
});
