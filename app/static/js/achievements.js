console.log("Achievements JS loaded");

let achievements = [];

async function loadAchievements() {
  console.log("Loading achievements...");

  try {
    const res = await fetch("/api/achievements");

    console.log("Response status:", res.status);

    const text = await res.text();
    console.log("Raw response:", text);

    const data = JSON.parse(text);
    console.log("ACHIEVEMENTS DATA:", data);

    achievements = data;
    renderAchievements();

  } catch (err) {
    console.error("ERROR loading achievements:", err);
  }
}

function renderAchievements() {
  const grid = document.querySelector(".achievement-grid");
  if (!grid) return;

  console.log("Rendering achievements into grid...");

  grid.innerHTML = "";

  achievements.forEach(a => {
    console.log("Creating box for:", a.name);

    const unlocked = a.unlocked;

    const col = document.createElement("div");
    col.className = "col-6 col-md-4";

    col.innerHTML = `
      <div class="achievement-box ${unlocked ? "unlocked" : "locked"}">
        <div class="icon">${unlocked ? "🏆" : "?"}</div>
        <div class="title">${unlocked ? a.name : maskText(a.name)}</div>
        <div class="desc">${unlocked ? a.description : maskText(a.description)}</div>
      </div>
    `;

    grid.appendChild(col);
  });

  console.log("DONE rendering");

  attachGlitchListeners();
}

/* popup */
function showAchievementPopup(name, icon = "🏆") {
  const popup = document.getElementById("achievement-popup");
  const popupName = document.getElementById("popup-name");
  const popupIcon = popup.querySelector(".popup-icon");

  popupName.textContent = name;
  popupIcon.textContent = icon;

  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 2500);
}

function maskText(text) {
  return text
    .split("")
    .map(char => (char === " " ? " " : "?"))
    .join("");
}


/* init */
loadAchievements();

const GLITCH_CHARS = "█▓▒░!@#$%?&*X01";

function glitchText(originalText) {
  return originalText
    .split("")
    .map(char => {
      if (char === " ") return " ";
      return Math.random() < 0.45
        ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        : char;
    })
    .join("");
}

function startGlitch(box) {
  const title = box.querySelector(".title");
  const desc = box.querySelector(".desc");
  const origTitle = title.textContent;
  const origDesc = desc.textContent;

  box._glitchInterval = setInterval(() => {
    title.textContent = glitchText(origTitle);
    desc.textContent = glitchText(origDesc);
  }, 60);
}

function stopGlitch(box) {
  clearInterval(box._glitchInterval);

  box.querySelector(".title").textContent = box._origTitle;
  box.querySelector(".desc").textContent = box._origDesc;
}

function attachGlitchListeners() {
  document.querySelectorAll(".achievement-box.locked").forEach(box => {
    box._origTitle = box.querySelector(".title").textContent;
    box._origDesc = box.querySelector(".desc").textContent;

    box.addEventListener("mouseenter", () => startGlitch(box));
    box.addEventListener("mouseleave", () => stopGlitch(box));
  });
}