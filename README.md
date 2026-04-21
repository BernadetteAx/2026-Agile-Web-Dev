# 2026-Agile-Web-Dev  

## Hangman – Online Multiplayer Hangman  

This is a project submission for Agile Web Development at the University of Western Australia.  

---

## Group Members  

UWA ID | Name | GitHub Username  
--- | --- | ---  
24224304 | Bernadette Arto  | BernadetteAx   
23829658 | Kelsey Chen	 | kkelseyC   
24527391 | Sam Rose | Stegossaurruss  

---

## Project Purpose

Hangman is a web-based Hangman game that allows users to play solo or interact with other players. Users can create accounts, play games, track scores, and view leaderboards. The application is designed to be engaging, intuitive, and interactive.  

The application enables users to:
- Create accounts and log in securely
- Play Hangman games (single-player and user-generated challenges)
- Track scores and game history
- Compete on a leaderboard

### Design Goals

The application is designed to be:
- Engaging through interactive gameplay and visual feedback
- Intuitive with a simple and clean user interface
- Effective in tracking user performance and progress

---

## Getting Started

These instructions will help you set up the project locally for development and testing.

### Prerequisites

Ensure you have the following installed:
- Node.js (if backend is used)
- npm or yarn
- Git

---

## Installation

```
# Clone the repository
git clone https://github.com/BernadetteAx/2026-Agile-Web-Dev 
```

```
# Navigate into the project directory
cd 2026-Agile-Web-Dev
```

```
# Install dependencies
npm install
```

## Running the Application

```
# Start the development server
npm start
```

## Running the Tests

```
#Execute the test suite
npm test
```

## Deployment

```
#Build the production version
npm run build
``` 

---

## Features  

This application includes the following functionality:  

- User authentication (signup/login/logout)  
- Single-player Hangman gameplay  
- Score tracking and persistence  
- Leaderboard system  
- User-created word challenges  
- Game history tracking  

---

## Technologies Used  

- [HTML]
- [CSS] 
- [JavaScript]  
- [Bootstrap] - The web framework used

---

## User Stories  

- As a user I want to create accounts to save progress  
- As a user I want to log in the access game history  
- As a user I want to have solo games to practice  
- As a user I want to guess letters so you solve words  
- As a user I want to have feedback on correct/incorrect guesses for progress  
- As a user I want to have a score saved to track improvement.  
- As a user I want to have a leaderboard so to compare with others  
- As a user I want to see my past games to review performance  
- As a user I want to have a limited number of guesses so the game is challenging  
- As a user I want to create my own word puzzles so others can play them?  
- As a user I want to play words created by other users?  
- As a user I want to have a visual hangman drawing so the game feels interactive  

---

## Application Design  

The application is designed to be:  

- Engaging through game visuals and scoring  
- Effective by providing quick gameplay  
- Intuitive with a simple interface  

---

## Main Pages  

The application consists of the following main pages:  

- Home Page (Intro + “Play Now” button)  
- Login Page  
- Signup Page  
- Dashboard (Welcome user, Start game, View leaderboard, View history)  
- Game Page (Word display (_ _ _ _), Keyboard input, Hangman drawing, Score display)  
- Leaderboard Page (Top players)  
- Create Word Page (Users submit words)  
- Profile Page (Stats, games played, wins/losses)  

---

## Basic UI Idea  

- Navigation bar (Home | Play | Leaderboard | Profile | Logout)  
- Big centered game area
- Letters displayed as buttons (A–Z)  
- Hangman image updates dynamically  

---

## Database Ideas  

- Users  
- Games  
- Words  
- Scores  

The application is expected to use the following data models:

- Users
	- user_id
	- username
	- password_hash
	- score
	- games_played
- Games
	- game_id
	- user_id
	- word
	- result (win/lose)
	- guesses_used
- Words
	- word_id
	- word_text
	- created_by
- Scores
	- score_id
	- user_id
	- score_value
	- timestamp