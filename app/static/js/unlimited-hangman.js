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
    if (letter.length === 1 && letter >= "A" && letter <= "Z") {
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
    document
      .querySelectorAll(".key")
      .forEach((k) => (k.style.pointerEvents = "none"));
    setTimeout(() => showResultPopup(false, word, streak), 400);
  } else if (wordDisplay.join("") === word) {
    gameOver = true;
    streak++;
    score.textContent = streak;
    usedWords.add(word);
    document
      .querySelectorAll(".key")
      .forEach((k) => (k.style.pointerEvents = "none"));
    // No popup, just go straight to next word
    setTimeout(() => initGame(), 1000);
  }
}

// Start the game
document.addEventListener("DOMContentLoaded", initGame);
