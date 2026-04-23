// Hangman Game Logic for Daily Game

const word = "CYCLE"; // Example word, later can be random
const maxMistakes = 6;
const initialTime = 90; // 1 minute 30 seconds
let mistakes = 0;
let guessedLetters = new Set();
let wordDisplay;
let tiles;
let gameOver = false;
let timeRemaining = initialTime;
let timerInterval;

const mistakeNum = document.getElementById("mistakeNum");
const hangmanFigure = document.getElementById("hangman-figure");
const hangmanParts = Array.from(hangmanFigure.children).slice(4); // Head, body, arms, legs
const gameTimer = document.querySelector(".game-timer");

// Initialize game
function initGame() {
  // Hide hangman parts initially
  hangmanParts.forEach((part) => (part.style.display = "none"));

  // Set up word display
  const wordRow = document.querySelector(".word-row");
  wordRow.innerHTML = "";
  for (let i = 0; i < word.length; i++) {
    wordRow.innerHTML +=
      '<div class="tile"><span class="tile-letter"></span></div>';
  }
  tiles = document.querySelectorAll(".tile");
  wordDisplay = Array(word.length).fill("");

  // Reset mistakes and guessed letters
  mistakes = 0;
  mistakeNum.textContent = "0";
  guessedLetters.clear();
  gameOver = false;
  timeRemaining = initialTime;
  updateTimerDisplay();

  // Add event listeners to keys
  document.querySelectorAll(".key").forEach((key) => {
    key.addEventListener("click", () => handleGuess(key.textContent.trim()));
  });

  // Also listen to keyboard
  document.addEventListener("keydown", (e) => {
    const letter = e.key.toUpperCase();
    if (letter.length === 1 && letter >= "A" && letter <= "Z") {
      handleGuess(letter);
    }
  });
}

function handleGuess(letter) {
  if (gameOver || guessedLetters.has(letter) || mistakes >= maxMistakes) return;

  guessedLetters.add(letter);

  // Start timer on first guess
  if (guessedLetters.size === 1) {
    startTimer();
  }

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
    if (mistakes <= hangmanParts.length) {
      hangmanParts[mistakes - 1].style.display = "block";
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

function showResultPopup(won, word, timeRemaining) {
  const popup = document.getElementById("result-popup");
  const icon = document.getElementById("result-icon");
  const title = document.getElementById("result-title");
  const sub = document.getElementById("result-sub");
  const wordReveal = document.getElementById("result-word-reveal");

  if (won) {
    icon.innerHTML =
      '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA2UlEQVR4nO3QQQ7DIAxEUd//0tN1LFUoEYwN/LetGg8/AgCAz1QsqokAtarfH8cHULNB9j0iwDtTXtlpjwjw9Pb32ex7RIA1B1f97+t37QcJkFTvsR8kQFK9x36QAEn1HvtBAiTVe+wHCZBU77Ef3DbAyKyHuPfYD14f4CsCNNsT7oP2B44QIDnt3hABktPuDV0fYDRwtuhOBFgrutPtAf4ZPeSYh/5DgOTt79vTbQE0WexGBJgrdqPbAmjx4PZBRICn3b7ffuB2AVaLbmQW3YgAXtXvBQDEAX6Fs5FCYTw98QAAAABJRU5ErkJggg==" alt="trophy" style="width:40px;height:40px;image-rendering:pixelated;">';
    title.textContent = "YOU WIN!";
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    sub.textContent = `${mistakes} mistake${mistakes !== 1 ? "s" : ""} · ${mins}:${secs.toString().padStart(2, "0")} left`;
    wordReveal.textContent = "";
  } else {
    icon.innerHTML =
      '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA7klEQVR4nO3QQZLEMAhDUe5/ac3a1KTctDEm7f+2KSNFZgAAAMmUzN5GDJDL3ka3DKCiwm2HEQP87605bYu1GUCnC5zuIwYoDuzWRwxQHNitj24bQM1+uLyvGGBkzbm6DGDtDm7GAE7ZQT3Izo/2WM03BnCyin6bH+2xmm8M4ESLfvo+6040b4oBnF3Fs+5E86YYwNlVPOtONG+KAbIPbpbeVwwwsuZcXQaw3QFPsos+BgXvLFNSEQZwqnKX6fYBPjUrtvq9PTHAqPr9cWKAUfX748QAo+r3x+n2AWY/NGO/RgwQY79Gtw8AALB+/gBv3TVmnpIGyAAAAABJRU5ErkJggg==" alt="thriller" style="width:40px;height:40px;image-rendering:pixelated;">';
    title.textContent = "GAME OVER";
    sub.textContent = "Better luck tomorrow";
    wordReveal.textContent = "WORD: " + word;
  }

  popup.classList.remove("hidden");
  // Force reflow so the animation fires
  popup.offsetHeight;
  popup.classList.add("show");
}

function checkGameEnd() {
  if (mistakes >= maxMistakes) {
    gameOver = true;
    stopTimer();
    // Reveal full word on tiles
    word.split("").forEach((char, i) => {
      tiles[i].querySelector(".tile-letter").textContent = char;
    });
    document
      .querySelectorAll(".key")
      .forEach((k) => (k.style.pointerEvents = "none"));
    setTimeout(() => showResultPopup(false, word, 0), 400);
    document
      .querySelectorAll(".key")
      .forEach((k) => (k.style.pointerEvents = "none"));
    setTimeout(() => showResultPopup(false, word, timeRemaining), 400);
  } else if (wordDisplay.join("") === word) {
    gameOver = true;
    stopTimer();
    document
      .querySelectorAll(".key")
      .forEach((k) => (k.style.pointerEvents = "none"));
    setTimeout(() => showResultPopup(true, word, timeRemaining), 400);
  }
}

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
      setTimeout(() => alert("Time's up! Game Over! The word was " + word), 10);
      // Disable further input
      document
        .querySelectorAll(".key")
        .forEach((key) => (key.style.pointerEvents = "none"));
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}

// Start the game
document.addEventListener("DOMContentLoaded", initGame);
