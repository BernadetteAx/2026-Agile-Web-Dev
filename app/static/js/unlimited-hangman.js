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
let gameId = null; // tracks current game session on the backend
 
const mistakeNum = document.getElementById("mistakeNum");
const hangmanFigure = document.getElementById("hangman-figure");
const score = document.getElementById("score");
const parts = [
  "part-head", "part-body", "part-left-arm",
  "part-right-arm", "part-left-leg", "part-right-leg"
];

// Fetch active game state from backend and restore if it exists
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

      initGame(true); // Initialize without fetching a new word

      // Restore the saved state
      restoreState(activeGame);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error fetching active game:", error);
    return false;
  }
}

// Restore a previously saved game state
function restoreState(state) {
  // Replay all guessed letters
  if (state.guessed_letters && state.guessed_letters.length > 0) {
    state.guessed_letters.forEach(letter => replayLetter(letter));
  }

  // Update the displayed score
  if (state.score !== undefined) {
    streak = state.score;
    score.textContent = streak;
  }
}

// Silently replay a letter without triggering game end logic
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


// Backend state saving
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
 
    const response = await fetch("/api/unlimited-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
 
    const data = await response.json();
 
    // Store the game_id returned by the server so subsequent saves update the same row
    if (data.game_id) {
      gameId = data.game_id;
    }
  } catch (err) {
    console.error("Failed to save unlimited game state:", err);
  }
}
 
// Initialise game (skipFetch is true when restoring from active game)
async function initGame(skipFetch = false) {
  // Fetch a new word only if we're not restoring from an active game
  if (!skipFetch) {
    // Keep fetching until we get a word not in usedWords
    let attempts = 0;
    do {
      try {
        const response = await fetch("/api/random-word");
        const data = await response.json();
        if (!response.ok) {
          console.error("Failed to fetch word:", data.error);
          return;
        }
        word = data.word;
        attempts++;
      } catch (err) {
        console.error("Error fetching word:", err);
        return;
      }
    } while (usedWords.has(word) && attempts < 10);

    gameId = null;
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

  // Save initial game state to backend so word is persisted even with 0 guesses
  if (!skipFetch) {
    await saveState(null);
  }
}
 
document.addEventListener("DOMContentLoaded", async () => {
  // Restore streak when refreshing page
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

  // Try to restore active game; if none exists, start a new one
  const hasActiveGame = await fetchActiveGame();
  if (!hasActiveGame) {
    initGame();
  }
});
 
// handle a guess
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
 
// win / loss detection
function checkGameEnd() {
  if (mistakes >= maxMistakes) {
    gameOver = true;
    const finalStreak = streak;
    streak = 0;
    score.textContent = streak;
    usedWords.clear();
 
    word.split("").forEach((char, i) => {
      tiles[i].querySelector(".tile-letter").textContent = char;
    });
    document.querySelectorAll(".key").forEach(k => k.style.pointerEvents = "none");
 
    saveState(false); // save loss to backend
 
    triggerGlitch();
    setTimeout(() => showResultPopup(false, word, finalStreak), 400);
 
  } else if (wordDisplay.join("") === word) {
    gameOver = true;
    streak++;
    score.textContent = streak;
    usedWords.add(word);
 
    document.querySelectorAll(".key").forEach(k => k.style.pointerEvents = "none");
 
    saveState(true); // save win to backend
 
    setTimeout(() => initGame(), 1000);
 
  } else {
    saveState(null); // in-progress snapshot
  }
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