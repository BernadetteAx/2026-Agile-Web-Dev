let currentMode = "daily";
let currentSort = "dailyScore";

async function fetchLeaderboardData() {
  const response = await fetch(`/api/leaderboard?mode=${currentMode}&sort=${currentSort}`);

  if (!response.ok) {
    throw new Error("Failed to load leaderboard data");
  }

  return await response.json();
}

function getDailyScore(player) {
  return 100 + player.timeLeft - player.mistakes * 15;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getDailyBadge(player, index, sortedData) {
  const lowestMistakes = Math.min(...sortedData.map((p) => p.mistakes));
  const highestTime = Math.max(...sortedData.map((p) => p.timeLeft));

  if (index === 0) return "DAILY KING";
  if (player.mistakes === lowestMistakes) return "CLEAN GUESS";
  if (player.timeLeft === highestTime) return "SPEED RUNNER";
  return "SURVIVOR";
}

function getUnlimitedBadge(player, index, sortedData) {
  const highestAccuracy = Math.max(...sortedData.map((p) => p.accuracy));
  const highestWords = Math.max(...sortedData.map((p) => p.totalWords));

  if (index === 0) return "STREAK MASTER";
  if (player.accuracy === highestAccuracy) return "SHARP SHOOTER";
  if (player.totalWords === highestWords) return "WORD HUNTER";
  return "RUNNER";
}



function renderHeader() {
  const header = document.getElementById("leaderboard-header-row");

  let metricTitle = "";

  if (currentMode === "daily") {
    if (currentSort === "dailyScore") {
      metricTitle = "SCORE";
    } else if (currentSort === "mistakes") {
      metricTitle = "MISTAKES";
    } else if (currentSort === "timeLeft") {
      metricTitle = "TIME LEFT";
    }

    header.className = "leaderboard-header-row daily-grid";
  } else {
    if (currentSort === "bestStreak") {
      metricTitle = "BEST STREAK";
    } else if (currentSort === "totalWords") {
      metricTitle = "TOTAL WORDS";
    } else if (currentSort === "games") {
      metricTitle = "GAMES";
    }

    header.className = "leaderboard-header-row unlimited-grid";
  }

  header.innerHTML = `
    <div>RANK</div>
    <div>USERNAME</div>
    <div>${metricTitle}</div>
  `;
}

function renderControls() {
  const controls = document.getElementById("leaderboard-controls");

  if (currentMode === "daily") {
    controls.innerHTML = `
      <button class="sort-button ${currentSort === "dailyScore" ? "active-sort" : ""}" data-sort="dailyScore">SORT BY SCORE</button>
      <button class="sort-button ${currentSort === "mistakes" ? "active-sort" : ""}" data-sort="mistakes">SORT BY MISTAKES</button>
      <button class="sort-button ${currentSort === "timeLeft" ? "active-sort" : ""}" data-sort="timeLeft">SORT BY TIME LEFT</button>
      <button class="sort-button" id="show-podium-btn">SHOW TOP 3</button>
    `;
  } else {
    controls.innerHTML = `
      <button class="sort-button ${currentSort === "bestStreak" ? "active-sort" : ""}" data-sort="bestStreak">SORT BY STREAK</button>
      <button class="sort-button ${currentSort === "totalWords" ? "active-sort" : ""}" data-sort="totalWords">SORT BY WORDS</button>
      <button class="sort-button ${currentSort === "games" ? "active-sort" : ""}" data-sort="games">SORT BY GAMES</button>
      <button class="sort-button" id="show-podium-btn">SHOW TOP 3</button>
    `;
  }

  document.querySelectorAll("[data-sort]").forEach((button) => {
    button.addEventListener("click", function () {
      currentSort = this.dataset.sort;
      renderLeaderboard();
    });
  });

  document.getElementById("show-podium-btn").addEventListener("click", showPodiumPopup);
}

function renderQuickStats(data) {
  const quickStats = document.getElementById("quick-stats");

  if (currentMode === "daily") {
    const bestScore = Math.max(...data.map((p) => getDailyScore(p)));
    const lowestMistakes = Math.min(...data.map((p) => p.mistakes));
    const bestTime = Math.max(...data.map((p) => p.timeLeft));

    quickStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">PLAYERS</div>
        <div class="stat-value">${data.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">BEST SCORE</div>
        <div class="stat-value">${bestScore}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">LOWEST MISTAKES</div>
        <div class="stat-value">${lowestMistakes}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">BEST TIME LEFT</div>
        <div class="stat-value">${formatTime(bestTime)}</div>
      </div>
    `;
  } else {
    const bestStreak = Math.max(...data.map((p) => p.bestStreak));
    const totalWords = data.reduce((sum, p) => sum + p.totalWords, 0);
    const totalGames = data.reduce((sum, p) => sum + p.games, 0);

    quickStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">PLAYERS</div>
        <div class="stat-value">${data.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">BEST STREAK</div>
        <div class="stat-value">${bestStreak}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">TOTAL WORDS</div>
        <div class="stat-value">${totalWords}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">TOTAL GAMES</div>
        <div class="stat-value">${totalGames}</div>
      </div>
    `;
  }
}

function renderChampion(data) {
  const championLabel = document.getElementById("champion-label");
  const championName = document.getElementById("champion-name");
  const championScore = document.getElementById("champion-score");
  const championDetail = document.getElementById("champion-detail");

  if (!data || data.length === 0) {
    championLabel.textContent = currentMode === "daily" ? "TODAY'S CHAMPION" : "ENDLESS CHAMPION";
    championName.textContent = "---";
    championScore.textContent = "NO DATA YET";
    championDetail.textContent = "Play a game to appear on the leaderboard.";
    return;
  }

  const champion = data[0];

  if (currentMode === "daily") {
    championLabel.textContent = "TODAY'S CHAMPION";
    championName.textContent = champion.username;
    championScore.textContent = `${champion.score} PTS`;
    championDetail.textContent = `${champion.mistakes} mistake${champion.mistakes !== 1 ? "s" : ""} · ${formatTime(champion.timeLeft)} left`;
  } else {
    championLabel.textContent = "ENDLESS CHAMPION";
    championName.textContent = champion.username;
    championScore.textContent = `${champion.bestStreak} WORD STREAK`;
    championDetail.textContent = `${champion.totalWords} total words · ${champion.games} games`;
  }
}

function renderDailyRows(data) {
  const body = document.getElementById("leaderboard-body");
  body.innerHTML = "";

  data.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "table-row daily-grid";

    let metricValue = "";

    if (currentSort === "dailyScore") {
      metricValue = getDailyScore(player);
    } else if (currentSort === "mistakes") {
      metricValue = player.mistakes;
    } else if (currentSort === "timeLeft") {
      metricValue = formatTime(player.timeLeft);
    }

    row.innerHTML = `
      <div class="rank-cell">#${index + 1}</div>
      <div class="player-cell">
        <span>${player.username}</span>
      </div>
      <div class="score-green">${metricValue}</div>
    `;

    body.appendChild(row);
  });
}

function renderUnlimitedRows(data) {
  const body = document.getElementById("leaderboard-body");
  body.innerHTML = "";

  data.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "table-row unlimited-grid";

    let metricValue = "";

    if (currentSort === "bestStreak") {
      metricValue = player.bestStreak;
    } else if (currentSort === "totalWords") {
      metricValue = player.totalWords;
    } else if (currentSort === "games") {
      metricValue = player.games;
    }

    row.innerHTML = `
      <div class="rank-cell">#${index + 1}</div>
      <div class="player-cell">
        <span>${player.username}</span>
      </div>
      <div class="score-green">${metricValue}</div>
    `;

    body.appendChild(row);
  });
}

async function renderLeaderboard() {

  let data = [];

  try {
    data = await fetchLeaderboardData();
  } catch (error) {
    console.error(error);
  }

  renderHeader();
  renderControls();

  if (currentMode === "daily") {
    renderQuickStats(data);
    renderChampion(data);
    renderDailyRows(data);
  } else {
    renderQuickStats(data);
    renderChampion(data);
    renderUnlimitedRows(data);
  }
}

async function showPodiumPopup() {
  const popup = document.getElementById("podium-popup");
  const stage = document.getElementById("podium-stage");
  const title = document.getElementById("podium-title");

  let data = [];

  try {
    data = await fetchLeaderboardData();
  } catch (error) {
    console.error(error);
  }

  const topThree = data.slice(0, 3);

  title.textContent = currentMode === "daily" ? "DAILY TOP 3" : "UNLIMITED TOP 3";

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  if (topThree.length === 0) {
    stage.innerHTML = `<div class="podium-player first">NO DATA YET</div>`;
    popup.classList.remove("hidden");
    return;
  }

  const podiumPlayers = [
    { player: first, place: "first", medal: "🥇", rank: "#1" },
    { player: second, place: "second", medal: "🥈", rank: "#2" },
    { player: third, place: "third", medal: "🥉", rank: "#3" }
  ].filter((item) => item.player);

stage.innerHTML = podiumPlayers.map((item) => {
  const player = item.player;

  let points = "";

  if (currentMode === "daily") {
    points = `${player.score} PTS<br>${player.mistakes} mistakes<br>${formatTime(player.timeLeft)} left`;
  } else {
    points = `${player.bestStreak} STREAK<br>${player.totalWords} words<br>${player.games} games`;
  }

  return `
    <div class="podium-player ${item.place}">
      <div class="podium-rank">${item.rank}</div>
      <div class="podium-name">
        <span class="medal-icon">${item.medal}</span>
        ${player.username}
        <span class="medal-icon">${item.medal}</span>
      </div>
      <div class="podium-points">${points}</div>
    </div>
  `;
}).join("");

  popup.classList.remove("hidden");
  triggerPodiumFireworks();
}

function triggerPodiumFireworks() {
  const colors = [
    "#ffffff",
    "#ffd700",
    "#c0c0c0",
    "#cd7f32",
    "#4e7f6a",
    "#00dcff",
    "#ff4ecd"
  ];

  const fireworkCount = 5;

  for (let i = 0; i < fireworkCount; i++) {
    setTimeout(function () {
      createOneFirework(colors);
    }, i * 180);
  }
}

function createOneFirework(colors) {
  const centerX = window.innerWidth * (0.25 + Math.random() * 0.5);
  const centerY = window.innerHeight * (0.18 + Math.random() * 0.35);
  const particles = 28;

  for (let i = 0; i < particles; i++) {
    const particle = document.createElement("div");
    particle.className = "firework-particle";

    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.PI * 2 * i) / particles;
    const distance = 80 + Math.random() * 90;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    particle.style.left = centerX + "px";
    particle.style.top = centerY + "px";
    particle.style.backgroundColor = color;
    particle.style.setProperty("--x", x + "px");
    particle.style.setProperty("--y", y + "px");

    document.body.appendChild(particle);

    setTimeout(function () {
      particle.remove();
    }, 900);
  }
}

function closePodiumPopup() {
  document.getElementById("podium-popup").classList.add("hidden");
}

function closeInstructions() {
  const popup = document.getElementById("instructions-popup");
  popup.classList.remove("show");
  popup.classList.add("hidden");
  localStorage.setItem(`leaderboardFirstVisit_${window.currentUserId}`, "false");
}

async function maybeShowInstructions() {
  const userId = await window.currentUserReady;
  if (!userId) return;

  if (localStorage.getItem(`leaderboardFirstVisit_${userId}`) !== "false") {
    const popup = document.getElementById("instructions-popup");
    popup.classList.remove("hidden");
    popup.offsetHeight;
    popup.classList.add("show");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  await maybeShowInstructions();

  document.getElementById("daily-tab").addEventListener("click", function () {
    currentMode = "daily";
    currentSort = "dailyScore";
    document.getElementById("daily-tab").classList.add("active-tab");
    document.getElementById("unlimited-tab").classList.remove("active-tab");
    renderLeaderboard();
    showPodiumPopup();
  });

  document.getElementById("unlimited-tab").addEventListener("click", function () {
    currentMode = "unlimited";
    currentSort = "bestStreak";
    document.getElementById("unlimited-tab").classList.add("active-tab");
    document.getElementById("daily-tab").classList.remove("active-tab");
    renderLeaderboard();
    showPodiumPopup();
  });

  document.getElementById("podium-close-btn").addEventListener("click", closePodiumPopup);

  renderLeaderboard();
});