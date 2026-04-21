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

/* render the achievments page */
function renderAchievements() {
  const grid = document.querySelector(".achievement-grid");
  if (!grid) return;

  grid.innerHTML = "";

  ACHIEVEMENTS_DB.forEach(a => {
    const unlocked = isUnlocked(a);

    const col = document.createElement("div");
    col.className = "col-6 col-md-4";

    col.innerHTML = `
      <div class="achievement-box ${unlocked ? "unlocked" : "locked"}">
        <div class="icon">${a.icon}</div>
        <div class="title">${a.title}</div>
        <div class="desc">${a.desc}</div>
      </div>
    `;

    grid.appendChild(col);
  });
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