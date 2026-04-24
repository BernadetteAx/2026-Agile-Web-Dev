// Unlimited Hangman Game Logic

const wordList = [
  "APPLE",
  "BANANA",
  "ORANGE",
  "GRAPE",
  "LEMON",
  "PEACH",
  "PLUM",
  "CHERRY",
  "STRAWBERRY",
  "BLUEBERRY",
  "RASPBERRY",
  "BLACKBERRY",
  "WATERMELON",
  "PINEAPPLE",
  "MANGO",
  "KIWI",
  "PAPAYA",
  "COCONUT",
  "AVOCADO",
  "TOMATO",
  "CARROT",
  "POTATO",
  "ONION",
  "GARLIC",
  "BROCCOLI",
  "SPINACH",
  "LETTUCE",
  "CUCUMBER",
  "ZUCCHINI",
  "PEPPER",
]; // 30 fruits and vegetables

const maxMistakes = 6;
let mistakes = 0;
let guessedLetters = new Set();
let wordDisplay;
let tiles;
let gameOver = false;
let streak = 0;
let word;
let usedWords = new Set();

const mistakeNum = document.getElementById("mistakeNum");
const hangmanFigure = document.getElementById("hangman-figure");
const score = document.getElementById("score");
const parts = [
  "part-head",
  "part-body",
  "part-left-arm",
  "part-right-arm",
  "part-left-leg",
  "part-right-leg"
];

// Initialize game
function initGame() {
  let availableWords = wordList.filter((w) => !usedWords.has(w));
  if (availableWords.length === 0) {
    usedWords.clear();
    availableWords = wordList;
  }
  word = availableWords[Math.floor(Math.random() * availableWords.length)];

  document.querySelectorAll(".part").forEach(el => {
    el.classList.remove("revealed");
  });

  // Set up word display
  const wordRow = document.querySelector(".word-row");
  wordRow.innerHTML = "";
  for (let i = 0; i < word.length; i++) {
    wordRow.innerHTML +=
      '<div class="tile"><span class="tile-letter"></span></div>';
  }
  tiles = document.querySelectorAll(".tile");
  wordDisplay = Array(word.length).fill("");

  mistakes = 0;
  mistakeNum.textContent = "0";
  guessedLetters.clear();
  gameOver = false;

  document.querySelectorAll(".key").forEach((key) => {
    key.removeAttribute("data-state");
    key.style.pointerEvents = "auto";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // attach listeners ONCE
  document.querySelectorAll(".key").forEach((key) => {
    key.addEventListener("click", () =>
      handleGuess(key.textContent.trim())
    );
  });

  document.addEventListener("keydown", (e) => {
    const letter = e.key.toUpperCase();
    if (letter.length === 1 && letter >= "A" && letter <= "Z") {
      handleGuess(letter);
    }
  });

  // start game
  initGame();
});

function handleGuess(letter) {
  if (gameOver || guessedLetters.has(letter) || mistakes >= maxMistakes) return;

  guessedLetters.add(letter);

  // Mark key as guessed
  document.querySelectorAll(".key").forEach((key) => {
    if (key.textContent.trim() === letter) {
      key.setAttribute("data-state", "guessed");
    }
  });

  if (word.toUpperCase().includes(letter)) {
    // Correct guess
    word.split("").forEach((char, index) => {
      if (char.toUpperCase() === letter) {
        wordDisplay[index] = char;
        tiles[index].querySelector(".tile-letter").textContent = char;
      }
    });
    // Mark key as correct
    document.querySelectorAll(".key").forEach((key) => {
      if (key.textContent.trim() === letter) {
        key.setAttribute("data-state", "correct");
      }
    });
  } else {
    // Incorrect guess
    mistakes++;
    mistakeNum.textContent = mistakes;
    
    // Show next hangman part
    if (mistakes <= parts.length) {
      const partElements = document.querySelectorAll(`.${parts[mistakes - 1]}`);
      partElements.forEach(el => {
        el.classList.remove("revealed");
        void el.offsetWidth;
        el.classList.add("revealed");
      });
    }
    // Mark key as incorrect
    document.querySelectorAll(".key").forEach((key) => {
      if (key.textContent.trim() === letter) {
        key.setAttribute("data-state", "wrong");
      }
    });
  }

  checkGameEnd();
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

  icon.innerHTML =
    '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA7klEQVR4nO3QQZLEMAhDUe5/ac3a1KTctDEm7f+2KSNFZgAAAMmUzN5GDJDL3ka3DKCiwm2HEQP87605bYu1GUCnC5zuIwYoDuzWRwxQHNitj24bQM1+uLyvGGBkzbm6DGDtDm7GAE7ZQT3Izo/2WM03BnCyin6bH+2xmm8M4ESLfvo+6040b4oBnF3Fs+5E86YYwNlVPOtONG+KAbIPbpbeVwwwsuZcXQaw3QFPsos+BgXvLFNSEQZwqnKX6fYBPjUrtvq9PTHAqPr9cWKAUfX748QAo+r3x+n2AWY/NGO/RgwQY79Gtw8AALB+/gBv3TVmnpIGyAAAAABJRU5ErkJggg==" alt="game over" style="width:40px;height:40px;image-rendering:pixelated;">';
  title.textContent = "GAME OVER";
  sub.textContent = `STREAK: ${currentStreak}`;
  wordReveal.textContent = "WORD: " + word;

  popup.classList.remove("hidden");
  popup.offsetHeight;
  popup.classList.add("show");
}

function checkGameEnd() {
  if (mistakes >= maxMistakes) {
    gameOver = true;
    streak = 0;
    score.textContent = streak;
    usedWords.clear();
    word.split("").forEach((char, i) => {
      tiles[i].querySelector(".tile-letter").textContent = char;
    });
    document.querySelectorAll(".key").forEach((k) => (k.style.pointerEvents = "none"));
    triggerGlitch();
    setTimeout(() => showResultPopup(false, word, streak), 400);
  } else if (wordDisplay.join("") === word) {
    gameOver = true;
    streak++;
    score.textContent = streak;
    usedWords.add(word);
    document
      .querySelectorAll(".key")
      .forEach((k) => (k.style.pointerEvents = "none"));
    setTimeout(() => initGame(), 1000);
  }
}

function triggerGlitch() {
  const wrapper = document.getElementById("glitch-wrapper");
  const duration = 900;
  const intervalMs = 50;
  let elapsed = 0;
  const activeBlocks = [];

  // whole-screen shake
  wrapper.classList.remove("glitching");
  void wrapper.offsetWidth;
  wrapper.classList.add("glitching");

  const interval = setInterval(() => {
    elapsed += intervalMs;

    // remove previous blocks
    activeBlocks.forEach(b => b.remove());
    activeBlocks.length = 0;

    // fade out toward end
    const fadeRatio = elapsed / duration;
    const numBlocks = Math.floor((1 - fadeRatio) * 35 + 5);

    for (let i = 0; i < numBlocks; i++) {
      const block = document.createElement("div");

      // Random position and size
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const w = Math.random() * 18 + 2;   
      const h = Math.random() * 3 + 0.5;  

      // cyan, teal, blue, green, purple, white, red
      const palettes = [
        `rgba(0, 220, 255, 0.85)`,
        `rgba(0, 255, 180, 0.8)`,
        `rgba(50, 100, 255, 0.85)`,
        `rgba(0, 180, 200, 0.9)`,
        `rgba(120, 0, 255, 0.8)`,
        `rgba(0, 255, 100, 0.85)`,
        `rgba(200, 255, 255, 0.9)`,
        `rgba(255, 255, 255, 0.7)`,
        `rgba(0, 100, 255, 0.9)`,
        `rgba(255, 0, 80, 0.75)`,    // occasional red
        `rgba(255, 200, 0, 0.75)`,   // occasional yellow
      ];
      const color = palettes[Math.floor(Math.random() * palettes.length)];

      block.style.cssText = `
        pointer-events: none;
        position: fixed;
        left: ${x}vw;
        top: ${y}vh;
        width: ${w}vw;
        height: ${h}vh;
        background: ${color};
        z-index: 600;
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
