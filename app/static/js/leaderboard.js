const players = [
  { name: "SAM", score: 320, wins: 15, streak: 4 },
  { name: "BERNIE", score: 280, wins: 12, streak: 3 },
  { name: "KELSEY", score: 300, wins: 14, streak: 2 },
  { name: "ALEX", score: 250, wins: 10, streak: 5 },
  { name: "JORDAN", score: 210, wins: 8, streak: 1 }
];

function renderLeaderboard(data) {
  const leaderboardBody = document.getElementById("leaderboard-body");
  leaderboardBody.innerHTML = "";

  for (let i = 0; i < data.length; i++) {
    const player = data[i];
    const row = document.createElement("div");
    row.className = "table-row";

    row.innerHTML = `
      <div class="rank-cell">#${i + 1}</div>
      <div class="player-cell">
        <div class="player-box ${i === 0 ? "top-player" : ""}"></div>
        <span>${player.name}</span>
      </div>
      <div>${player.score}</div>
      <div>${player.wins}</div>
      <div>${player.streak}</div>
    `;

    leaderboardBody.appendChild(row);
  }
}

document.getElementById("sort-score").addEventListener("click", function () {
  players.sort(function (a, b) {
    return b.score - a.score;
  });
  renderLeaderboard(players);
});

document.getElementById("sort-wins").addEventListener("click", function () {
  players.sort(function (a, b) {
    return b.wins - a.wins;
  });
  renderLeaderboard(players);
});

document.getElementById("sort-streak").addEventListener("click", function () {
  players.sort(function (a, b) {
    return b.streak - a.streak;
  });
  renderLeaderboard(players);
});

renderLeaderboard(players);