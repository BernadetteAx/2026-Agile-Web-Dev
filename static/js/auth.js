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
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const password = document.getElementById("registerPassword").value.toLowerCase();
        const confirmPassword = document.getElementById("registerConfirmPassword").value.toLowerCase();
        const message = document.getElementById("registerMessage");

        message.textContent = "";

        if (username === "" || email === "" || password === "" || confirmPassword === "") {
            message.textContent = "PLEASE FILL IN ALL FIELDS.";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = "PASSWORDS DO NOT MATCH.";
            return;
        }

        if (!isValidPassword(password)) {
            message.textContent = "PASSWORD MUST BE 8+ CHARACTERS WITH LETTERS AND NUMBERS.";
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
            confirmed: false
        };

        users.push(newUser);
        saveUsers(users);

        localStorage.setItem("pendingEmail", email);
        window.location.href = "confirm.html";
    };
}

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.onclick = function () {
        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value.toLowerCase();
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
                window.location.href = "register.html";
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
                window.location.href = "confirm.html";
            }, 1000);
            return;
        }

        localStorage.setItem("currentUserEmail", user.email);
        window.location.href = "home.html";
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

        window.location.href = "home.html";
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
        welcomeText.textContent = "WELCOME, " + currentUser.username.toUpperCase() + "!";
    } else {
        welcomeText.textContent = "WELCOME!";
    }
}

const startGameBtn = document.getElementById("startGameBtn");

if (startGameBtn) {
    startGameBtn.onclick = function () {
        alert("Game page can be linked here later.");
    };
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.onclick = function () {
        localStorage.removeItem("currentUserEmail");
        window.location.href = "login.html";
    };
}