// Password visibility toggles
document.getElementById("toggleLoginPassword")?.addEventListener("click", () => {
  const input = document.getElementById("loginPassword");
  const icon = document.querySelector("#toggleLoginPassword i");
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("bi-eye-slash", "bi-eye");
  } else {
    input.type = "password";
    icon.classList.replace("bi-eye", "bi-eye-slash");
  }
});

document.getElementById("toggleRegisterPassword")?.addEventListener("click", () => {
  const input = document.getElementById("registerPassword");
  const icon = document.querySelector("#toggleRegisterPassword i");
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("bi-eye-slash", "bi-eye");
  } else {
    input.type = "password";
    icon.classList.replace("bi-eye", "bi-eye-slash");
  }
});

// Register
document.getElementById("registerBtn")?.addEventListener("click", async () => {
  const username = document.getElementById("registerUsername").value.trim();
  const email    = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value;
  const confirm  = document.getElementById("registerConfirmPassword").value;
  const msg      = document.getElementById("registerMessage");

  msg.textContent = "";

  if (!username || !email || !password || !confirm) {
    showMessage(msg, "PLEASE FILL IN ALL FIELDS.", "error");
    return;
  }

  if (password !== confirm) {
    showMessage(msg, "PASSWORDS DO NOT MATCH.", "error");
    return;
  }

  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    showMessage(msg, "PASSWORD MUST BE 8+ CHARACTERS WITH LETTERS AND NUMBERS.", "error");
    return;
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(msg, "ACCOUNT CREATED! REDIRECTING...", "success");
      setTimeout(() => window.location.href = "/home", 800);
    } else {
      showMessage(msg, data.error?.toUpperCase() || "REGISTRATION FAILED.", "error");
    }
  } catch (err) {
    showMessage(msg, "COULD NOT CONNECT TO THE SERVER.", "error");
  }
});

// Login
document.getElementById("loginBtn")?.addEventListener("click", async () => {
  const email    = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const msg      = document.getElementById("loginMessage");

  msg.textContent = "";

  if (!email || !password) {
    showMessage(msg, "PLEASE FILL IN ALL FIELDS.", "error");
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(msg, "LOGGED IN! REDIRECTING...", "success");
      setTimeout(() => window.location.href = "/home", 800);
    } else {
      showMessage(msg, data.error?.toUpperCase() || "LOGIN FAILED.", "error");
    }
  } catch (err) {
    showMessage(msg, "COULD NOT CONNECT TO THE SERVER.", "error");
  }
});

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
});

// Welcome text — fetches the current user from the session
const welcomeText = document.getElementById("welcomeText");
if (welcomeText) {
  fetch("/api/auth/me")
    .then(r => r.json())
    .then(data => {
      welcomeText.textContent = data.username
        ? "WELCOME, " + data.username.toUpperCase() + "!"
        : "WELCOME!";
    })
    .catch(() => {
      welcomeText.textContent = "WELCOME!";
    });
}

// Start game button
document.getElementById("startGameBtn")?.addEventListener("click", () => {
  window.location.href = "/daily";
});

// Helper
function showMessage(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.style.color = type === "error" ? "#ff4e4e" : "#00ffb4";
}