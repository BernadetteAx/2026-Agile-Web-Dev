// Hangman Game Logic for Daily Game

let word = "";
let dailyWordId = null;
const maxMistakes = 6;
const initialTime = 90;
let mistakes = 0;
let guessedLetters = new Set();
let wordDisplay;
let tiles;
let gameOver = false;
let timeRemaining = initialTime;
let timerInterval;

const mistakeNum = document.getElementById("mistakeNum");
const hangmanFigure = document.getElementById("hangman-figure");
const gameTimer = document.querySelector(".game-timer");
const parts = [
  "part-head",
  "part-body",
  "part-left-arm",
  "part-right-arm",
  "part-left-leg",
  "part-right-leg"
];


// fetch daily word and resume any saved state
async function fetchDailyWord() {
  try {
    const response = await fetch("/api/daily-word");
    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch daily word:", data.error);
      alert("Failed to load the daily word. Please try again.");
      return;
    }

    word = data.word;
    dailyWordId = data.daily_word_id;

    initGame();

    if (data.saved_state) {
      // if game is finished show the popup and lock keybaord
      if (data.saved_state.won !== null) {
        restoreState(data.saved_state);
        gameOver = true;
        document.querySelectorAll(".key").forEach(k => k.style.pointerEvents = "none");
        return;
      }
      // for game in progress restore state
      restoreState(data.saved_state);
    }

  } catch (error) {
    console.error("Error fetching daily word:", error);
    alert("Error connecting to the server. Please try again.");
  }
}

// Restore a previously saved game state
function restoreState(state) {
  if (state.won !== null) {
    gameOver = true;
    if (!state.won) {
      word.split("").forEach((char, i) => {
        tiles[i].querySelector(".tile-letter").textContent = char;
      });
    }
    document.querySelectorAll(".key").forEach(k => k.style.pointerEvents = "none");
    showResultPopup(state.won, word, state.time_left ?? 0);
    return;
  }

  state.guessed_letters.forEach(letter => replayLetter(letter));

  if (state.time_left !== null && state.time_left !== undefined) {
    timeRemaining = state.time_left;
    updateTimerDisplay();
  }

  if (guessedLetters.size > 0 && !gameOver) {
    startTimer();
  }
}

// silently replay a letter
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

// save current state to the backend
async function saveState(won = null) {
  if (!dailyWordId) return;

  try {
    await fetch("/api/daily-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        daily_word_id: dailyWordId,
        guessed_letters: [...guessedLetters].join(""),
        mistakes: mistakes,
        time_left: timeRemaining,
        hangman_state: mistakes,
        won: won,
      }),
    });
  } catch (err) {
    console.error("Failed to save game state:", err);
  }
}

// initialise game board
function initGame() {
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
  timeRemaining = initialTime;
  updateTimerDisplay();

  document.querySelectorAll(".key").forEach(key => {
    key.addEventListener("click", () => handleGuess(key.textContent.trim()));
  });

  document.addEventListener("keydown", e => {
    const letter = e.key.toUpperCase();
    if (letter.length === 1 && letter >= "A" && letter <= "Z") {
      handleGuess(letter);
    }
  });
}

// Handle a live guess
function handleGuess(letter) {
  if (gameOver || guessedLetters.has(letter) || mistakes >= maxMistakes) return;

  guessedLetters.add(letter);

  if (guessedLetters.size === 1) startTimer();

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

// win / loss detection
function checkGameEnd() {
  if (mistakes >= maxMistakes) {
    gameOver = true;
    stopTimer();
    saveState(false);

    word.split("").forEach((char, i) => {
      tiles[i].querySelector(".tile-letter").textContent = char;
    });
    document.querySelectorAll(".key").forEach(k => k.style.pointerEvents = "none");
    triggerGlitch();
    setTimeout(() => showResultPopup(false, word, timeRemaining), 950);

  } else if (wordDisplay.join("") === word) {
    gameOver = true;
    stopTimer();
    saveState(true);

    document.querySelectorAll(".key").forEach(k => k.style.pointerEvents = "none");
    triggerConfetti();
    setTimeout(() => showResultPopup(true, word, timeRemaining), 400);

  } else {
    saveState(null);
  }
}

// result popup
function showResultPopup(won, word, timeRemaining) {
  const popup = document.getElementById("result-popup");
  const icon = document.getElementById("result-icon");
  const title = document.getElementById("result-title");
  const sub = document.getElementById("result-sub");
  const wordReveal = document.getElementById("result-word-reveal");

  if (won) {
    icon.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA2UlEQVR4nO3QQQ7DIAxEUd//0tN1LFUoEYwN/LetGg8/AgCAz1QsqokAtarfH8cHULNB9j0iwDtTXtlpjwjw9Pb32ex7RIA1B1f97+t37QcJkFTvsR8kQFK9x36QAEn1HvtBAiTVe+wHCZBU77Ef3DbAyKyHuPfYD14f4CsCNNsT7oP2B44QIDnt3hABktPuDV0fYDRwtuhOBFgrutPtAf4ZPeSYh/5DgOTt79vTbQE0WexGBJgrdqPbAmjx4PZBRICn3b7ffuB2AVaLbmQW3YgAXtXvBQDEAX6Fs5FCYTw98QAAAABJRU5ErkJggg==" alt="trophy" style="width:40px;height:40px;image-rendering:pixelated;">';
    title.textContent = "YOU WIN!";
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    sub.textContent = `${mistakes} mistake${mistakes !== 1 ? "s" : ""} · ${mins}:${secs.toString().padStart(2, "0")} left`;
    wordReveal.textContent = "";
  } else {
    icon.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA7klEQVR4nO3QQZLEMAhDUe5/ac3a1KTctDEm7f+2KSNFZgAAAMmUzN5GDJDL3ka3DKCiwm2HEQP87605bYu1GUCnC5zuIwYoDuzWRwxQHNitj24bQM1+uLyvGGBkzbm6DGDtDm7GAE7ZQT3Izo/2WM03BnCyin6bH+2xmm8M4ESLfvo+6040b4oBnF3Fs+5E86YYwNlVPOtONG+KAbIPbpbeVwwwsuZcXQaw3QFPsos+BgXvLFNSEQZwqnKX6fYBPjUrtvq9PTHAqPr9cWKAUfX748QAo+r3x+n2AWY/NGO/RgwQY79Gtw8AALB+/gBv3TVmnpIGyAAAAABJRU5ErkJggg==" alt="thriller" style="width:40px;height:40px;image-rendering:pixelated;">';
    title.textContent = "GAME OVER";
    sub.textContent = "Better luck tomorrow";
    wordReveal.textContent = "WORD: " + word;
  }

  popup.classList.remove("hidden");
  popup.offsetHeight;
  popup.classList.add("show");
}

// timer
function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  gameTimer.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      stopTimer();
      gameOver = true;
      saveState(false);
      document.querySelectorAll(".key").forEach(key => key.style.pointerEvents = "none");
      setTimeout(() => showResultPopup(false, word, 0), 10);
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
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

function triggerConfetti() {
  const colors = ["#4e7f6a", "#ffffff", "#00dcff", "#00ffb4", "#7b2fff", "#ffee00", "#ff4ecd", "#00ff64"];
  const numPixels = 200;
  const pixels = [];
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight / 3;

  for (let i = 0; i < numPixels; i++) {
    const pixel = document.createElement("div");
    const size = Math.floor(Math.random() * 14 + 6);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 600 + 200;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - (Math.random() * 400 + 200);
    const duration = Math.random() * 600 + 600;
    const delay = Math.random() * 150;

    pixel.style.cssText = `
      position: fixed; left: ${originX}px; top: ${originY}px;
      width: ${size}px; height: ${size}px;
      background: ${color}; z-index: 800;
      pointer-events: none; image-rendering: pixelated; opacity: 1;
    `;
    document.body.appendChild(pixel);
    pixels.push({ el: pixel, vx, vy, duration, delay });
  }

  pixels.forEach(({ el, vx, vy, duration, delay }) => {
    let start = null;
    function animate(ts) {
      if (!start) start = ts + delay;
      const elapsed = ts - start;
      if (elapsed < 0) { requestAnimationFrame(animate); return; }
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 2);
      const x = vx * ease;
      const gravity = 300 * progress * progress;
      const y = vy * ease + gravity;
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.opacity = (1 - progress).toFixed(2);
      if (progress < 1) requestAnimationFrame(animate);
      else el.remove();
    }
    requestAnimationFrame(animate);
  });
}

document.addEventListener("DOMContentLoaded", fetchDailyWord);
