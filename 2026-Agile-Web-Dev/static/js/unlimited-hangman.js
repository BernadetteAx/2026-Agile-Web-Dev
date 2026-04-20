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
const hangmanParts = Array.from(hangmanFigure.children).slice(4); // Head, body, arms, legs
const score = document.getElementById("score");

// Initialize game
function initGame() {
  // Select random word, avoiding repeats if on streak
  let availableWords = wordList.filter((w) => !usedWords.has(w));
  if (availableWords.length === 0) {
    usedWords.clear();
    availableWords = wordList;
  }
  word = availableWords[Math.floor(Math.random() * availableWords.length)];

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

  // Reset keyboard states
  document.querySelectorAll(".key").forEach((key) => {
    key.removeAttribute("data-state");
    key.style.pointerEvents = "auto";
  });

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
    streak = 0;
    score.textContent = streak;
    usedWords.clear();
    setTimeout(() => alert("Game Over! The word was " + word), 10);
    // Disable further input
    document
      .querySelectorAll(".key")
      .forEach((key) => (key.style.pointerEvents = "none"));
    // Start new game after delay
    setTimeout(() => initGame(), 2000);
  } else if (wordDisplay.join("") === word) {
    gameOver = true;
    streak++;
    score.textContent = streak;
    usedWords.add(word);
    // Disable further input
    document
      .querySelectorAll(".key")
      .forEach((key) => (key.style.pointerEvents = "none"));
    // Start new game after delay
    setTimeout(() => initGame(), 2000);
  }
}

// Start the game
document.addEventListener("DOMContentLoaded", initGame);