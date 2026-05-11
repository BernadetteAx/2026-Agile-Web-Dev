const dailyPlayers = [
  { username: "PIXELSAM", mistakes: 1, timeLeft: 72 },
  { username: "MOONCAT", mistakes: 0, timeLeft: 58 },
  { username: "ALEX99", mistakes: 2, timeLeft: 80 },
  { username: "BEEBEE", mistakes: 2, timeLeft: 45 },
  { username: "KELSEY", mistakes: 3, timeLeft: 64 },
  { username: "JORDAN", mistakes: 4, timeLeft: 35 },
  { username: "NOVA", mistakes: 1, timeLeft: 49 },
  { username: "GHOST", mistakes: 5, timeLeft: 22 }
];

const unlimitedPlayers = [
  { username: "ALEX99", bestStreak: 14, totalWords: 88, games: 12, accuracy: 82 },
  { username: "PIXELSAM", bestStreak: 11, totalWords: 74, games: 10, accuracy: 78 },
  { username: "NOVA", bestStreak: 9, totalWords: 61, games: 9, accuracy: 84 },
  { username: "MOONCAT", bestStreak: 8, totalWords: 55, games: 8, accuracy: 75 },
  { username: "BEEBEE", bestStreak: 6, totalWords: 42, games: 7, accuracy: 70 },
  { username: "KELSEY", bestStreak: 5, totalWords: 39, games: 7, accuracy: 73 },
  { username: "JORDAN", bestStreak: 4, totalWords: 33, games: 6, accuracy: 66 },
  { username: "GHOST", bestStreak: 3, totalWords: 21, games: 5, accuracy: 64 }
];

let currentMode = "daily";
let currentSort = "dailyScore";

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

function getSortedDailyPlayers() {
  const data = [...dailyPlayers];

  if (currentSort === "dailyScore") {
    data.sort(function (a, b) {
      return getDailyScore(b) - getDailyScore(a) || a.mistakes - b.mistakes || b.timeLeft - a.timeLeft;
    });
  } else if (currentSort === "mistakes") {
    data.sort(function (a, b) {
      return a.mistakes - b.mistakes || b.timeLeft - a.timeLeft;
    });
  } else if (currentSort === "timeLeft") {
    data.sort(function (a, b) {
      return b.timeLeft - a.timeLeft || a.mistakes - b.mistakes;
    });
  }

  return data;
}

function getSortedUnlimitedPlayers() {
  const data = [...unlimitedPlayers];

  if (currentSort === "bestStreak") {
    data.sort(function (a, b) {
      return b.bestStreak - a.bestStreak || b.accuracy - a.accuracy;
    });
  } else if (currentSort === "totalWords") {
    data.sort(function (a, b) {
      return b.totalWords - a.totalWords || b.bestStreak - a.bestStreak;
    });
  } else if (currentSort === "accuracy") {
    data.sort(function (a, b) {
      return b.accuracy - a.accuracy || b.bestStreak - a.bestStreak;
    });
  }

  return data;
}

function getOfficialDailyRanking() {
  const data = [...dailyPlayers];

  data.sort(function (a, b) {
    return getDailyScore(b) - getDailyScore(a) || a.mistakes - b.mistakes || b.timeLeft - a.timeLeft;
  });

  return data;
}

function getOfficialUnlimitedRanking() {
  const data = [...unlimitedPlayers];

  data.sort(function (a, b) {
    return b.bestStreak - a.bestStreak || b.accuracy - a.accuracy || b.totalWords - a.totalWords;
  });

  return data;
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
    } else if (currentSort === "accuracy") {
      metricTitle = "ACCURACY";
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
      <button class="sort-button ${currentSort === "accuracy" ? "active-sort" : ""}" data-sort="accuracy">SORT BY ACCURACY</button>
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
    const topAccuracy = Math.max(...data.map((p) => p.accuracy));

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
        <div class="stat-label">TOP ACCURACY</div>
        <div class="stat-value">${topAccuracy}%</div>
      </div>
    `;
  }
}

function renderChampion() {
  const officialData = currentMode === "daily" ? getOfficialDailyRanking() : getOfficialUnlimitedRanking();
  const champion = officialData[0];

  const championLabel = document.getElementById("champion-label");
  const championName = document.getElementById("champion-name");
  const championScore = document.getElementById("champion-score");
  const championDetail = document.getElementById("champion-detail");

  if (currentMode === "daily") {
    championLabel.textContent = "TODAY'S CHAMPION";
    championName.textContent = champion.username;
    championScore.textContent = `${getDailyScore(champion)} PTS`;
    championDetail.textContent = `${champion.mistakes} mistake${champion.mistakes !== 1 ? "s" : ""} · ${formatTime(champion.timeLeft)} left`;
  } else {
    championLabel.textContent = "ENDLESS CHAMPION";
    championName.textContent = champion.username;
    championScore.textContent = `${champion.bestStreak} WORD STREAK`;
    championDetail.textContent = `${champion.totalWords} total words · ${champion.games} games · ${champion.accuracy}% accuracy`;
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
    } else if (currentSort === "accuracy") {
      metricValue = `${player.accuracy}%`;
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

function renderLeaderboard() {
  let data;

  renderHeader();
  renderControls();

  if (currentMode === "daily") {
    data = getSortedDailyPlayers();
    renderQuickStats(data);
    renderChampion();
    renderDailyRows(data);
  } else {
    data = getSortedUnlimitedPlayers();
    renderQuickStats(data);
    renderChampion();
    renderUnlimitedRows(data);
  }
}

function showPodiumPopup() {
  const popup = document.getElementById("podium-popup");
  const stage = document.getElementById("podium-stage");
  const title = document.getElementById("podium-title");

  const data = currentMode === "daily" ? getOfficialDailyRanking() : getOfficialUnlimitedRanking();
  const topThree = data.slice(0, 3);

  title.textContent = currentMode === "daily" ? "DAILY TOP 3" : "UNLIMITED TOP 3";

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  if (currentMode === "daily") {
    stage.innerHTML = `
      <div class="podium-player first">
        <div class="podium-rank">#1</div>
        <div class="podium-name">
          <span class="medal-icon">🥇</span>
          ${first.username}
          <span class="medal-icon">🥇</span>
        </div>
        <div class="podium-points">${getDailyScore(first)} PTS<br>${first.mistakes} mistakes<br>${formatTime(first.timeLeft)} left</div>
      </div>

      <div class="podium-player second">
        <div class="podium-rank">#2</div>
        <div class="podium-name">
          <span class="medal-icon">🥈</span>
          ${second.username}
          <span class="medal-icon">🥈</span>
        </div>
        <div class="podium-points">${getDailyScore(second)} PTS<br>${second.mistakes} mistakes<br>${formatTime(second.timeLeft)} left</div>
      </div>

      <div class="podium-player third">
        <div class="podium-rank">#3</div>
        <div class="podium-name">
          <span class="medal-icon">🥉</span>
          ${third.username}
          <span class="medal-icon">🥉</span>
        </div>
        <div class="podium-points">${getDailyScore(third)} PTS<br>${third.mistakes} mistakes<br>${formatTime(third.timeLeft)} left</div>
      </div>
    `;
  } else {
    stage.innerHTML = `
      <div class="podium-player first">
        <div class="podium-rank">#1</div>
        <div class="podium-name">
          <span class="medal-icon">🥇</span>
          ${first.username}
          <span class="medal-icon">🥇</span>
        </div>
        <div class="podium-points">${first.bestStreak} STREAK<br>${first.totalWords} words<br>${first.accuracy}% accuracy</div>
      </div>

      <div class="podium-player second">
        <div class="podium-rank">#2</div>
        <div class="podium-name">
          <span class="medal-icon">🥈</span>
          ${second.username}
          <span class="medal-icon">🥈</span>
        </div>
        <div class="podium-points">${second.bestStreak} STREAK<br>${second.totalWords} words<br>${second.accuracy}% accuracy</div>
      </div>

      <div class="podium-player third">
        <div class="podium-rank">#3</div>
        <div class="podium-name">
          <span class="medal-icon">🥉</span>
          ${third.username}
          <span class="medal-icon">🥉</span>
        </div>
        <div class="podium-points">${third.bestStreak} STREAK<br>${third.totalWords} words<br>${third.accuracy}% accuracy</div>
      </div>
    `;
  }

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

document.addEventListener("DOMContentLoaded", function () {
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