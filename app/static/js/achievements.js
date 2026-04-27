/* acheivement "database" - CHANGE */
/* i want to change icons to custom ones after we figure out all the achievements*/
const ACHIEVEMENTS_DB = [
  {
    id: "first_win",
    title: "FIRST WIN",
    desc: "Win your first game",
    icon: "🏆",
    condition: (stats) => stats.wins >= 1
  },
  {
    id: "streak_5",
    title: "STREAK 5",
    desc: "Win 5 games in a row",
    icon: "🔥",
    condition: (stats) => stats.streak >= 5
  },
  {
    id: "perfect_game",
    title: "PERFECT",
    desc: "0 mistakes in a game",
    icon: "🎯",
    condition: (stats) => stats.mistakes === 0
  }
];

/* fake backend part - CHANGE */
const defaultStats = {
  wins: 0,
  streak: 0,
  mistakes: 0
};

let playerStats =
  JSON.parse(localStorage.getItem("playerStats")) || defaultStats;

/* unlocked tracking (prevents repeat popups) */
let unlockedAchievements =
  JSON.parse(localStorage.getItem("unlockedAchievements")) || [];

/* save func */
function saveStats() {
  localStorage.setItem("playerStats", JSON.stringify(playerStats));
  localStorage.setItem("unlockedAchievements", JSON.stringify(unlockedAchievements));
}

/* check if achievements is unlocked already */
function isUnlocked(achievement) {
  return achievement.condition(playerStats);
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

function renderAchievements() {
  const grid = document.querySelector(".achievement-grid");
  if (!grid) return;

  grid.innerHTML = "";

  ACHIEVEMENTS_DB.forEach(a => {
    const unlocked = isUnlocked(a);

    const col = document.createElement("div");
    col.className = "col-6 col-md-4";

    const displayTitle = unlocked ? a.title : maskText(a.title);
    const displayDesc = unlocked ? a.desc : maskText(a.desc);
    const displayIcon = unlocked ? a.icon : "?";

    col.innerHTML = `
      <div class="achievement-box ${unlocked ? "unlocked" : "locked"}">
        <div class="icon">${displayIcon}</div>
        <div class="title">${displayTitle}</div>
        <div class="desc">${displayDesc}</div>
      </div>
    `;

    grid.appendChild(col);
  });

  attachGlitchListeners();
}

/* check and tirgger the unlock of acheivement */
function checkAchievements() {
  ACHIEVEMENTS_DB.forEach(a => {
    const unlocked = isUnlocked(a);

    if (unlocked && !unlockedAchievements.includes(a.id)) {
      unlockedAchievements.push(a.id);

      saveStats();

      showAchievementPopup(a.title, a.icon);
    }
  });
}

/* game update helpers (call these from Hangman) */
function addWin() {
  playerStats.wins += 1;
  playerStats.streak += 1;

  saveStats();
  checkAchievements();
}

function addLoss() {
  playerStats.streak = 0;
  playerStats.mistakes = 6;

  saveStats();
}

/* init */
document.addEventListener("DOMContentLoaded", () => {
  renderAchievements();
  checkAchievements();
});

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
  const a = ACHIEVEMENTS_DB.find(a => {
    const titleEl = box.querySelector(".title");
    return titleEl && box._origTitle;
  });
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