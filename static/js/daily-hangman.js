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
    if (letter >= "A" && letter <= "Z") {
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

function checkGameEnd() {
  if (mistakes >= maxMistakes) {
    gameOver = true;
    stopTimer();
    setTimeout(() => alert("Game Over! The word was " + word), 10);
    // Disable further input
    document
      .querySelectorAll(".key")
      .forEach((key) => (key.style.pointerEvents = "none"));
  } else if (wordDisplay.join("") === word) {
    gameOver = true;
    stopTimer();
    setTimeout(() => alert("You win!"), 10);
    // Disable further input
    document
      .querySelectorAll(".key")
      .forEach((key) => (key.style.pointerEvents = "none"));
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
