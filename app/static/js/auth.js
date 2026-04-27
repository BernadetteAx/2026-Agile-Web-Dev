function getUsers() {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function isValidPassword(password) {
  const lowered = password.toLowerCase();

  if (lowered.length < 8) {
    return false;
  }

  const hasLetter = /[a-z]/.test(lowered);
  const hasNumber = /[0-9]/.test(lowered);

  return hasLetter && hasNumber;
}

const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {
  registerBtn.onclick = function () {
    const username = document.getElementById("registerUsername").value.trim();
    const email = document
      .getElementById("registerEmail")
      .value.trim()
      .toLowerCase();
    const password = document
      .getElementById("registerPassword")
      .value.toLowerCase();
    const confirmPassword = document
      .getElementById("registerConfirmPassword")
      .value.toLowerCase();
    const message = document.getElementById("registerMessage");

    message.textContent = "";

    if (
      username === "" ||
      email === "" ||
      password === "" ||
      confirmPassword === ""
    ) {
      message.textContent = "PLEASE FILL IN ALL FIELDS.";
      return;
    }

    if (password !== confirmPassword) {
      message.textContent = "PASSWORDS DO NOT MATCH.";
      return;
    }

    if (!isValidPassword(password)) {
      message.textContent =
        "PASSWORD MUST BE 8+ CHARACTERS WITH LETTERS AND NUMBERS.";
      return;
    }

    const users = getUsers();

    const usernameExists = users.some(function (user) {
      return user.username.toLowerCase() === username.toLowerCase();
    });

    if (usernameExists) {
      message.textContent = "USERNAME IS ALREADY TAKEN.";
      return;
    }

    const emailExists = users.some(function (user) {
      return user.email.toLowerCase() === email.toLowerCase();
    });

    if (emailExists) {
      message.textContent = "EMAIL IS ALREADY REGISTERED.";
      return;
    }

    const newUser = {
      username: username,
      email: email,
      password: password,
      confirmed: false,
    };

    users.push(newUser);
    saveUsers(users);

    localStorage.setItem("pendingEmail", email);
    window.location.href = "/confirm";
  };
}

const toggleLoginPassword = document.getElementById("toggleLoginPassword");

if (toggleLoginPassword) {
  toggleLoginPassword.onclick = function () {
    const loginPassword = document.getElementById("loginPassword");
    const icon = toggleLoginPassword.querySelector("i");

    if (loginPassword.type === "password") {
      loginPassword.type = "text";

      icon.classList.remove("bi-eye-slash");
      icon.classList.add("bi-eye");
    } else {
      loginPassword.type = "password";

      icon.classList.remove("bi-eye");
      icon.classList.add("bi-eye-slash");
    }
  };
}

const toggleRegisterPassword = document.getElementById("toggleRegisterPassword");

if (toggleRegisterPassword) {
  toggleRegisterPassword.onclick = function () {
    const registerPassword = document.getElementById("registerPassword");
    const icon = toggleRegisterPassword.querySelector("i");

    if (registerPassword.type === "password") {
      registerPassword.type = "text";

      icon.classList.remove("bi-eye-slash");
      icon.classList.add("bi-eye");
    } else {
      registerPassword.type = "password";

      icon.classList.remove("bi-eye");
      icon.classList.add("bi-eye-slash");
    }
  };
}

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.onclick = function () {
    const email = document
      .getElementById("loginEmail")
      .value.trim()
      .toLowerCase();
    const password = document
      .getElementById("loginPassword")
      .value.toLowerCase();
    const message = document.getElementById("loginMessage");

    message.textContent = "";

    if (email === "" || password === "") {
      message.textContent = "PLEASE FILL IN ALL FIELDS.";
      return;
    }

    const users = getUsers();

    const user = users.find(function (item) {
      return item.email.toLowerCase() === email;
    });

    if (!user) {
      message.textContent = "NO ACCOUNT FOUND. PLEASE REGISTER FIRST.";
      setTimeout(function () {
        window.location.href = "/register";
      }, 1000);
      return;
    }

    if (user.password !== password) {
      message.textContent = "INCORRECT PASSWORD.";
      return;
    }

    if (!user.confirmed) {
      message.textContent = "PLEASE CONFIRM YOUR EMAIL FIRST.";
      localStorage.setItem("pendingEmail", user.email);
      setTimeout(function () {
        window.location.href = "/confirm";
      }, 1000);
      return;
    }

    localStorage.setItem("currentUserEmail", user.email);
    window.location.href = "/home";
  };
}

const confirmBtn = document.getElementById("confirmBtn");

if (confirmBtn) {
  confirmBtn.onclick = function () {
    const pendingEmail = localStorage.getItem("pendingEmail");
    const users = getUsers();

    const updatedUsers = users.map(function (user) {
      if (user.email === pendingEmail) {
        user.confirmed = true;
      }
      return user;
    });

    saveUsers(updatedUsers);
    localStorage.setItem("currentUserEmail", pendingEmail);
    localStorage.removeItem("pendingEmail");

    window.location.href = "/home";
  };
}

const welcomeText = document.getElementById("welcomeText");

if (welcomeText) {
  const currentUserEmail = localStorage.getItem("currentUserEmail");
  const users = getUsers();

  const currentUser = users.find(function (user) {
    return user.email === currentUserEmail;
  });

  if (currentUser) {
    welcomeText.textContent =
      "WELCOME, " + currentUser.username.toUpperCase() + "!";
  } else {
    welcomeText.textContent = "WELCOME!";
  }
}

const startGameBtn = document.getElementById("startGameBtn");

if (startGameBtn) {
  startGameBtn.onclick = function () {
    window.location.href = "/daily";
  };
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.onclick = function () {
    localStorage.removeItem("currentUserEmail");
    window.location.href = "/login";
  };
}
