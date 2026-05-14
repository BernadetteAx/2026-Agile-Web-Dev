// Unlimited Hangman Game Logic
  
const maxMistakes = 6;
let mistakes = 0;
let guessedLetters = new Set();
let wordDisplay;
let tiles;
let gameOver = false;
let streak = 0;
let word;
let usedWords = new Set();
let gameId = null;
let challengeId = null; // set when launched from a friend challenge
 
const mistakeNum = document.getElementById("mistakeNum");
const hangmanFigure = document.getElementById("hangman-figure");
const score = document.getElementById("score");
const parts = [
  "part-head", "part-body", "part-left-arm",
  "part-right-arm", "part-left-leg", "part-right-leg"
];

async function fetchActiveGame() {
  try {
    const response = await fetch("/api/unlimited-state/active");
    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch active game:", data.error);
      return false;
    }

    if (data.active_game) {
      const activeGame = data.active_game;
      word = activeGame.word;
      gameId = activeGame.game_id;

      initGame(true);
      restoreState(activeGame);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error fetching active game:", error);
    return false;
  }
}

function restoreState(state) {
  if (state.guessed_letters && state.guessed_letters.length > 0) {
    state.guessed_letters.forEach(letter => replayLetter(letter));
  }

  if (state.score !== undefined) {
    streak = state.score;
    score.textContent = streak;
  }
}

function replayLetter(letter) {
  if (guessedLetters.has(letter)) return;
  guessedLetters.add(letter);

  document.querySelectorAll(".key").forEach(key => {
    if (key.textContent.trim() === letter) key.setAttribute("data-state", "guessed");
  });

  if (word.toUpperCase().includes(letter)) {
    word.split("").forEach((char, index) => {
      if (char.toUpperCase() === letter) {
        wordDisplay[index] = char;
        tiles[index].querySelector(".tile-letter").textContent = char;
      }
    });
    document.querySelectorAll(".key").forEach(key => {
      if (key.textContent.trim() === letter) key.setAttribute("data-state", "correct");
    });
  } else {
    mistakes++;
    mistakeNum.textContent = mistakes;
    if (mistakes <= parts.length) {
      const partElements = document.querySelectorAll(`.${parts[mistakes - 1]}`);
      partElements.forEach(el => {
        el.classList.remove("revealed");
        void el.offsetWidth;
        el.classList.add("revealed");
      });
    }
    document.querySelectorAll(".key").forEach(key => {
      if (key.textContent.trim() === letter) key.setAttribute("data-state", "wrong");
    });
  }
}

// attach challenge_id when present
async function saveState(won = null) {
  try {
    const body = {
      game_id: gameId,
      word: word,
      guessed_letters: [...guessedLetters].join(""),
      mistakes: mistakes,
      score: streak,
      time_left: null,
      hangman_state: mistakes,
      won: won,
    };

    if (challengeId !== null) {
      body.challenge_id = challengeId;
    }
 
    const response = await fetch("/api/unlimited-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
 
    const data = await response.json();
    if (data.game_id) gameId = data.game_id;
  } catch (err) {
    console.error("Failed to save unlimited game state:", err);
  }
}
 
async function initGame(skipFetch = false) {
  if (!skipFetch) {
    try {
      const response = await fetch("/api/random-word");
      const data = await response.json();
      if (!response.ok) {
        console.error("Failed to fetch word:", data.error);
        return;
      }
      word = data.word;
    } catch (err) {
      console.error("Error fetching word:", err);
      return;
    }

    gameId = null;
    challengeId = null; // clear challenge when starting a fresh game
  }

  document.querySelectorAll(".part").forEach(el => el.classList.remove("revealed"));

  const wordRow = document.querySelector(".word-row");
  wordRow.innerHTML = "";
  for (let i = 0; i < word.length; i++) {
    wordRow.innerHTML += '<div class="tile"><span class="tile-letter"></span></div>';
  }
  tiles = document.querySelectorAll(".tile");
  wordDisplay = Array(word.length).fill("");

  mistakes = 0;
  mistakeNum.textContent = "0";
  guessedLetters.clear();
  gameOver = false;

  document.querySelectorAll(".key").forEach(key => {
    key.removeAttribute("data-state");
    key.style.pointerEvents = "auto";
  });

  if (!skipFetch) {
    await saveState(null);
  }
}

// load a friend challenge by id
async function loadChallenge(id) {
  try {
    const res  = await fetch(`/api/challenge/${id}`);
    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to load challenge:", data.error);
      initGame();
      return;
    }

    if (data.status === "played") {
      showChallengeAlreadyPlayed(data.from);
      return;
    }

    challengeId = data.challenge_id;
    word        = data.word;

    showChallengeBanner(data.from);
    await initGame(true);
  } catch (err) {
    console.error("Error loading challenge:", err);
    initGame();
  }
}

// small banner above the board during a challenge
function showChallengeBanner(fromName) {
  let banner = document.getElementById("challenge-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "challenge-banner";
    banner.style.cssText =
      "text-align:center;font-size:0.5rem;letter-spacing:.08em;" +
      "color:#4e7f6a;opacity:.85;margin-bottom:8px;font-family:var(--font-press,monospace);";
    document.querySelector(".word-row")?.parentElement?.prepend(banner);
  }
  banner.textContent = `CHALLENGE FROM ${fromName}`;
}

// shown if the challenge was already played
function showChallengeAlreadyPlayed(fromName) {
  const popup     = document.getElementById("result-popup");
  const icon      = document.getElementById("result-icon");
  const title     = document.getElementById("result-title");
  const sub       = document.getElementById("result-sub");
  const wordReveal = document.getElementById("result-word-reveal");

  icon.textContent  = "⚔";
  icon.style.fontSize = "1.4rem";
  title.textContent = "ALREADY PLAYED";
  sub.textContent   = `YOU'VE ALREADY PLAYED ${fromName}'S CHALLENGE.`;
  wordReveal.textContent = "";

  popup.classList.remove("hidden");
  popup.offsetHeight;
  popup.classList.add("show");
}
 
function closeInstructions() {
  const popup = document.getElementById("instructions-popup");
  popup.classList.remove("show");
  popup.classList.add("hidden");
  localStorage.setItem(`unlimitedFirstVisit_${window.currentUserId}`, "false");
}

async function maybeShowInstructions() {
  const userId = await window.currentUserReady;
  if (!userId) return;

  if (localStorage.getItem(`unlimitedFirstVisit_${userId}`) !== "false") {
    const popup = document.getElementById("instructions-popup");
    popup.classList.remove("hidden");
    popup.offsetHeight;
    popup.classList.add("show");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await maybeShowInstructions();

  try {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.streak) {
      streak = data.streak;
      score.textContent = streak;
    }
  } catch (err) {
    console.error("Failed to fetch streak:", err);
  }

  document.querySelectorAll(".key").forEach(key => {
    key.addEventListener("click", () => handleGuess(key.textContent.trim()));
  });

  document.addEventListener("keydown", e => {
    const letter = e.key.toUpperCase();
    if (letter.length === 1 && letter >= "A" && letter <= "Z") {
      handleGuess(letter);
    }
  });

  // check for challenge_id in URL before normal flow
  const params = new URLSearchParams(window.location.search);
  const urlChallenge = params.get("challenge_id");

  if (urlChallenge) {
    await loadChallenge(parseInt(urlChallenge, 10));
  } else {
    const hasActiveGame = await fetchActiveGame();
    if (!hasActiveGame) initGame();
  }
});
 
function handleGuess(letter) {
  if (gameOver || guessedLetters.has(letter) || mistakes >= maxMistakes) return;
 
  guessedLetters.add(letter);
 
  document.querySelectorAll(".key").forEach(key => {
    if (key.textContent.trim() === letter) key.setAttribute("data-state", "guessed");
  });
 
  if (word.toUpperCase().includes(letter)) {
    word.split("").forEach((char, index) => {
      if (char.toUpperCase() === letter) {
        wordDisplay[index] = char;
        tiles[index].querySelector(".tile-letter").textContent = char;
      }
    });
    document.querySelectorAll(".key").forEach(key => {
      if (key.textContent.trim() === letter) key.setAttribute("data-state", "correct");
    });
  } else {
    mistakes++;
    mistakeNum.textContent = mistakes;
    if (mistakes <= parts.length) {
      const partElements = document.querySelectorAll(`.${parts[mistakes - 1]}`);
      partElements.forEach(el => {
        el.classList.remove("revealed");
        void el.offsetWidth;
        el.classList.add("revealed");
      });
    }
    document.querySelectorAll(".key").forEach(key => {
      if (key.textContent.trim() === letter) key.setAttribute("data-state", "wrong");
    });
  }
 
  checkGameEnd();
}
 
function checkGameEnd() {
  if (mistakes >= maxMistakes) {
    gameOver = true;
    const finalStreak = streak;

    if (challengeId === null) {
      streak = 0;
      score.textContent = streak;
      usedWords.clear();
    }

    word.split("").forEach((char, i) => {
      tiles[i].querySelector(".tile-letter").textContent = char;
    });
    document.querySelectorAll(".key").forEach(k => k.style.pointerEvents = "none");

    saveState(false);

    if (challengeId !== null) {
      triggerGlitch();
      setTimeout(() => redirectAfterChallenge(false, word), 400);
    } else {
      triggerGlitch();
      setTimeout(() => showResultPopup(false, word, finalStreak), 400);
    }

  } else if (wordDisplay.join("") === word) {
    gameOver = true;

    if (challengeId === null) {
      streak++;
      score.textContent = streak;
      usedWords.add(word);
    }

    document.querySelectorAll(".key").forEach(k => k.style.pointerEvents = "none");

    saveState(true);

    if (challengeId !== null) {
      setTimeout(() => redirectAfterChallenge(true, word), 1000);
    } else {
      setTimeout(() => initGame(), 1000);
    }

  } else {
    saveState(null);
  }
}

function redirectAfterChallenge(won, word) {
  // clear the banner
  const banner = document.getElementById("challenge-banner");
  if (banner) banner.remove();

  // redirect to friends page with a result flag so they see feedback
  const result = won ? "won" : "lost";
  window.location.href = `/friends?challenge=${result}&word=${word}`;
}
 
function closePopupAndPlay() {
  const popup = document.getElementById("result-popup");
  popup.classList.remove("show");
  setTimeout(() => {
    popup.classList.add("hidden");
    initGame();
  }, 200);
}
 
function showResultPopup(won, word, currentStreak) {
  const popup = document.getElementById("result-popup");
  const icon = document.getElementById("result-icon");
  const title = document.getElementById("result-title");
  const sub = document.getElementById("result-sub");
  const wordReveal = document.getElementById("result-word-reveal");
 
  icon.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA7klEQVR4nO3QQZLEMAhDUe5/ac3a1KTctDEm7f+2KSNFZgAAAMmUzN5GDJDL3ka3DKCiwm2HEQP87605bYu1GUCnC5zuIwYoDuzWRwxQHNitj24bQM1+uLyvGGBkzbm6DGDtDm7GAE7ZQT3Izo/2WM03BnCyin6bH+2xmm8M4ESLfvo+6040b4oBnF3Fs+5E86YYwNlVPOtONG+KAbIPbpbeVwwwsuZcXQaw3QFPsos+BgXvLFNSEQZwqnKX6fYBPjUrtvq9PTHAqPr9cWKAUfX748QAo+r3x+n2AWY/NGO/RgwQY79Gtw8AALB+/gBv3TVmnpIGyAAAAABJRU5ErkJggg==" alt="game over" style="width:40px;height:40px;image-rendering:pixelated;">';
  title.textContent = "GAME OVER";
  sub.textContent = `STREAK: ${currentStreak}`;
  wordReveal.textContent = "WORD: " + word;
 
  popup.classList.remove("hidden");
  popup.offsetHeight;
  popup.classList.add("show");
}

function triggerGlitch() {
  const wrapper = document.getElementById("glitch-wrapper");
  const duration = 900;
  const intervalMs = 50;
  let elapsed = 0;
  const activeBlocks = [];
 
  wrapper.classList.remove("glitching");
  void wrapper.offsetWidth;
  wrapper.classList.add("glitching");
 
  const interval = setInterval(() => {
    elapsed += intervalMs;
    activeBlocks.forEach(b => b.remove());
    activeBlocks.length = 0;
 
    const fadeRatio = elapsed / duration;
    const numBlocks = Math.floor((1 - fadeRatio) * 35 + 5);
 
    for (let i = 0; i < numBlocks; i++) {
      const block = document.createElement("div");
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const w = Math.random() * 18 + 2;
      const h = Math.random() * 3 + 0.5;
      const palettes = [
        `rgba(0, 220, 255, 0.85)`, `rgba(0, 255, 180, 0.8)`,
        `rgba(50, 100, 255, 0.85)`, `rgba(0, 180, 200, 0.9)`,
        `rgba(120, 0, 255, 0.8)`, `rgba(0, 255, 100, 0.85)`,
        `rgba(200, 255, 255, 0.9)`, `rgba(255, 255, 255, 0.7)`,
        `rgba(0, 100, 255, 0.9)`, `rgba(255, 0, 80, 0.75)`,
        `rgba(255, 200, 0, 0.75)`,
      ];
      const color = palettes[Math.floor(Math.random() * palettes.length)];
      block.style.cssText = `
        pointer-events: none; position: fixed;
        left: ${x}vw; top: ${y}vh;
        width: ${w}vw; height: ${h}vh;
        background: ${color}; z-index: 600;
        mix-blend-mode: screen;
        opacity: ${(Math.random() * 0.5 + 0.5).toFixed(2)};
      `;
      document.body.appendChild(block);
      activeBlocks.push(block);
    }
 
    if (elapsed >= duration) {
      clearInterval(interval);
      activeBlocks.forEach(b => b.remove());
      wrapper.classList.remove("glitching");
    }
  }, intervalMs);
}