(function () {
  const TOKEN_KEY = "hsa_auth_token";
  const USER_KEY = "hsa_auth_user";
  const API_BASE_KEY = "hsa_api_base_url";
  const DEFAULT_API_BASE_URL = "https://w2happ22.onrender.com";
  const originalFetch = window.fetch.bind(window);

  function configuredApiBase() {
    const saved = localStorage.getItem(API_BASE_KEY);
    const value = saved && !saved.includes("your-render-backend-url")
      ? saved
      : window.HSA_API_BASE_URL || DEFAULT_API_BASE_URL;
    return value.replace(/\/$/, "");
  }

  function apiUrl(input) {
    if (typeof input !== "string" || !input.startsWith("/api")) return input;
    return `${configuredApiBase()}${input}`;
  }

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function storedUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  }

  function saveSession(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  window.fetch = function (input, init) {
    const nextInit = Object.assign({}, init || {});
    const headers = new Headers(nextInit.headers || {});
    const url = typeof input === "string" ? input : input.url;

    if (url && url.includes("/api/") && token()) {
      headers.set("Authorization", `Bearer ${token()}`);
    }

    nextInit.headers = headers;
    return originalFetch(apiUrl(input), nextInit);
  };

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .auth-shell {
        width: min(100%, 1100px);
        margin: 16px auto 0;
        padding: 0 20px;
      }
      .auth-panel {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 16px;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 14px;
        align-items: center;
      }
      .auth-title {
        font-family: var(--display);
        color: var(--text);
        font-size: 15px;
        font-weight: 700;
      }
      .auth-muted {
        color: var(--muted);
        font-size: 12px;
        margin-top: 2px;
      }
      .auth-actions, .auth-form, .auth-api-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }
      .auth-form {
        grid-column: 1 / -1;
        display: none;
        padding-top: 12px;
        border-top: 1px solid var(--border);
      }
      .auth-form.visible { display: flex; }
      .auth-form input, .auth-api-row input {
        min-width: 190px;
        flex: 1;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text);
        font-family: var(--mono);
        font-size: 12px;
        padding: 10px 12px;
        outline: none;
      }
      .auth-form input:focus, .auth-api-row input:focus { border-color: var(--accent); }
      .auth-small-btn {
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--card);
        color: var(--text);
        cursor: pointer;
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: .5px;
        padding: 10px 12px;
        text-transform: uppercase;
      }
      .auth-small-btn.primary {
        border-color: var(--accent);
        color: var(--accent);
      }
      .auth-small-btn.danger {
        border-color: rgba(255,71,87,.4);
        color: var(--red);
      }
      .auth-error {
        grid-column: 1 / -1;
        color: var(--red);
        font-size: 12px;
        min-height: 16px;
      }
      .auth-api-row {
        grid-column: 1 / -1;
        display: none;
      }
      .auth-api-row.visible { display: flex; }
      @media (max-width: 720px) {
        .auth-panel { grid-template-columns: 1fr; }
        .auth-actions { justify-content: flex-start; }
      }
    `;
    document.head.appendChild(style);
  }

  function createPanel() {
    const shell = document.createElement("div");
    shell.className = "auth-shell";
    shell.innerHTML = `
      <section class="auth-panel" aria-label="Account">
        <div>
          <div class="auth-title" id="authTitle">Login required</div>
          <div class="auth-muted" id="authSubtitle">Create an account or log in to analyze scans.</div>
        </div>
        <div class="auth-actions">
          <button class="auth-small-btn primary" id="showLoginBtn" type="button">Login</button>
          <button class="auth-small-btn" id="showSignupBtn" type="button">Signup</button>
          <button class="auth-small-btn" id="showApiBtn" type="button">API URL</button>
          <button class="auth-small-btn danger" id="logoutBtn" type="button" style="display:none;">Logout</button>
        </div>
        <form class="auth-form" id="loginForm">
          <input id="loginEmail" type="email" placeholder="Email" autocomplete="email" required />
          <input id="loginPassword" type="password" placeholder="Password" autocomplete="current-password" required />
          <button class="auth-small-btn primary" type="submit">Login</button>
        </form>
        <form class="auth-form" id="signupForm">
          <input id="signupName" type="text" placeholder="Full name" autocomplete="name" required />
          <input id="signupEmail" type="email" placeholder="Email" autocomplete="email" required />
          <input id="signupPassword" type="password" placeholder="Password, min 8 chars" autocomplete="new-password" required />
          <button class="auth-small-btn primary" type="submit">Create Account</button>
        </form>
        <div class="auth-api-row" id="apiRow">
          <input id="apiBaseInput" type="url" placeholder="https://your-render-service.onrender.com" />
          <button class="auth-small-btn primary" id="saveApiBtn" type="button">Save</button>
          <button class="auth-small-btn" id="clearApiBtn" type="button">Clear</button>
        </div>
        <div class="auth-error" id="authError"></div>
      </section>
    `;

    const header = document.querySelector("header");
    header.insertAdjacentElement("afterend", shell);
  }

  function setAuthError(message) {
    document.getElementById("authError").textContent = message || "";
  }

  function showForm(formId) {
    ["loginForm", "signupForm"].forEach(id => {
      document.getElementById(id).classList.toggle("visible", id === formId);
    });
    setAuthError("");
  }

  function renderAuth() {
    const user = storedUser();
    const isAuthed = Boolean(token() && user);
    document.getElementById("authTitle").textContent = isAuthed ? `Signed in as ${user.name}` : "Login required";
    document.getElementById("authSubtitle").textContent = isAuthed
      ? user.email
      : "Create an account or log in to analyze scans.";
    document.getElementById("showLoginBtn").style.display = isAuthed ? "none" : "";
    document.getElementById("showSignupBtn").style.display = isAuthed ? "none" : "";
    document.getElementById("logoutBtn").style.display = isAuthed ? "" : "none";
    if (isAuthed) showForm("");
  }

  async function submitAuth(path, body) {
    setAuthError("");
    const response = await originalFetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Authentication failed");
    saveSession(data);
    renderAuth();
  }

  function wireEvents() {
    document.getElementById("showLoginBtn").addEventListener("click", () => showForm("loginForm"));
    document.getElementById("showSignupBtn").addEventListener("click", () => showForm("signupForm"));
    document.getElementById("showApiBtn").addEventListener("click", () => {
      const row = document.getElementById("apiRow");
      row.classList.toggle("visible");
      document.getElementById("apiBaseInput").value = configuredApiBase();
    });
    document.getElementById("saveApiBtn").addEventListener("click", () => {
      const value = document.getElementById("apiBaseInput").value.trim().replace(/\/$/, "");
      if (value) localStorage.setItem(API_BASE_KEY, value);
      setAuthError(value ? "API URL saved." : "Enter your Render backend URL.");
    });
    document.getElementById("clearApiBtn").addEventListener("click", () => {
      localStorage.removeItem(API_BASE_KEY);
      document.getElementById("apiBaseInput").value = "";
      setAuthError("API URL cleared.");
    });
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      try {
        await originalFetch(apiUrl("/api/auth/logout"), { method: "POST" });
      } finally {
        clearSession();
        renderAuth();
      }
    });
    document.getElementById("loginForm").addEventListener("submit", async event => {
      event.preventDefault();
      try {
        await submitAuth("/api/auth/login", {
          email: document.getElementById("loginEmail").value,
          password: document.getElementById("loginPassword").value,
        });
      } catch (err) {
        setAuthError(err.message);
      }
    });
    document.getElementById("signupForm").addEventListener("submit", async event => {
      event.preventDefault();
      try {
        await submitAuth("/api/auth/signup", {
          name: document.getElementById("signupName").value,
          email: document.getElementById("signupEmail").value,
          password: document.getElementById("signupPassword").value,
        });
      } catch (err) {
        setAuthError(err.message);
      }
    });
    document.addEventListener("click", event => {
      if (event.target && event.target.id === "analyseBtn" && !token()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showForm("loginForm");
        setAuthError("Please log in before analyzing a scan.");
      }
    }, true);
  }

  async function refreshSession() {
    if (!token()) return;
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) throw new Error("Session check failed");
      const data = await response.json();
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } catch {
      clearSession();
    } finally {
      renderAuth();
    }
  }

  injectStyles();
  createPanel();
  wireEvents();
  renderAuth();
  refreshSession();
})();
