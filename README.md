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
A minimum of Python 3.7 is required to run this project.

On Linux:
```
$ sudo apt-get install python3
```

On Mac:
```
$ brew install python3
```

On Windows, go to the [Python website](https://www.python.org/downloads/) and download the installer.

You will also need Git installed:
```
$ git --version
```

---

## Installation

Clone the repository and navigate into the project directory:
```
$ git clone https://github.com/BernadetteAx/2026-Agile-Web-Dev
$ cd 2026-Agile-Web-Dev
```

Set up a virtual environment. It is recommended to run this application on Linux or Mac, as pip on Windows does not always correctly manage packages.

On Mac and Linux:
```
$ python3 -m venv flask
$ source flask/bin/activate
$ pip install -r requirements.txt
```

On Windows:
```
$ python -m venv flask
$ flask\Scripts\activate
$ pip install -r requirements.txt
```
---

## Create .env file

Contents:
```
HANGMAN_SECRET_KEY=#put_secret_key_here_with_no_hashtag
FLASK_APP=app
FLASK_ENV=development
```
---

## Initialise database

```
flask db upgrade
```
---

## Running the Application

Set the Flask app environment variable and start the development server.

On Mac and Linux:
```
$ export FLASK_APP=app.py
```
```
$ flask run
or
$ python3 run.py

```

On Windows:
```
$ set FLASK_APP=app.py
```
```
$ flask run
or
$ python run.py
```

The app will be available at `http://127.0.0.1:5000` by default.

---

## Running the Tests

Open the root directory of the project in a terminal and enter:
```
# Start the app first
flask run
```

On a separate terminal, enter the virtual environment:
```
# Run on separate terminal
MacOS/Linux: python3 -m pytest app/tests/test_selenium.py -v
Windows: python -m pytest app/tests/test_selenium.py -v
```
```
# Run with (on separate terminal)
MacOs/Linux: python3 -m pytest app/tests/test_unit.py -v
Windows: python -m pytest app/tests/test_unit.py -v
```
---

## Features  

This application includes the following functionality:  

- User authentication (signup/login/logout)  
- Single-player Hangman gameplay  
- Score tracking and persistence  
- Leaderboard system
- Unlockable achievements
- Friend system
- User-created word challenges  
- Game history tracking  

---

## Technologies Used

- HTML
- CSS
- JavaScript
- Python 3
- [Flask](https://flask.palletsprojects.com/) – web framework
- Bootstrap – front-end styling
- SQLite
- Selenium testing unit

---

## User Stories  

- As a user I want to create accounts to save progress  
- As a user I want to log in the access game history  
- As a user I want to have solo games to practice  
- As a user I want to guess letters so you solve words  
- As a user I want to have feedback on correct/incorrect guesses for progress  
- As a user I want to have a score saved to track improvement
- As a user I want to have a leaderboard so to compare with others  
- As a user I want to see my past games to review performance  
- As a user I want to have a limited number of guesses so the game is challenging  
- As a user I want to create my own word puzzles so others can play them
- As a user I want to play words created by other users
- As a user I want to have a visual hangman drawing so the game feels interactive  

---

## Application Design  

The application is designed to be:  

- Engaging through game visuals and scoring  
- Effective by providing quick gameplay  
- Intuitive with a simple interface  

---

## Application Design

### Main Pages

| Page | Description |
|------|-------------|
| Home | Intro screen with a "Start Now" and  "Log out" button |
| Login | User login form, option to register |
| Register | New account registration |
| Daily Game | Word display (`_ _ _ _`), letter keyboard, hangman drawing, and timer |
| Unlimited Game | Word display (`_ _ _ _`), letter keyboard, hangman drawing, and score |
| Leaderboard | Top players ranked by score, toggle from Daily and Unlimited scores, sorting buttons |
| Achievements | List of achievements (either locked or unlocked) |
| Friends | Search bar to add friends, friends list, "Send Word" button, challenges recieved |

### UI Layout

- Navigation bar: Daily | Unlimited | Leaderboard | Achievements | Friends | Logout
- Large centered game/content area
- A–Z letter buttons for input
- Hangman image updates dynamically with each incorrect guess
- Other content updates dynamically with updated database information

---

## Database Schema

### Users
| Field    | Type |
|----------|------|
| id | Integer (PK) |
| email | String(120) |
| username | String(50) |
| password | String(256) |
| wins | Integer |
| streak | Integer |


### DailyWords
| Field | Type |
|-------|------|
| id | Integer (PK) |
| word | String(50) |
| date | Date |


### Achievements
| Field | Type |
|-------|------|
| id | Integer (PK) |
| name | String(100) |
| description | String(255) |
| image_url | String(1000) |
| condition_type | String(50) |
| threshold_value | Integer |


### UserAchievements
| Field | Type |
|-------|------|
| id | Integer (PK) |
| user_id | Integer (FK: Users) |
| achievement_id | Integer (FK: Achievements) |
| unlocked_at | DateTime |


### DailyGameStates
| Field | Type |
|-------|------|
| id | Integer (PK) |
| user_id | Integer (FK: Users) |
| daily_word_id | Integer (FK: DailyWords) |
| guessed_letters | String(26) |
| mistakes | Integer |
| time_left | Integer |
| hangman_state | Integer |
| won | Boolean |
| timestamp | DateTime |


### UnlimitedGameStates
| Field | Type |
|-------|------|
| id | Integer (PK) |
| user_id | Integer (FK: Users) |
| word | String(50) |
| guessed_letters | String(26) |
| mistakes | Integer |
| score | Integer |
| time_left | Integer |
| hangman_state | Integer |
| won | Boolean |
| started_at | DateTime |
| updated_at | DateTime |


### Friendships
| Field | Type |
|-------|------|
| id | Integer (PK) |
| user_id | Integer (FK: Users) |
| friend_id | Integer (FK: Users) |
| created_at | DateTime |


### FriendChallenges
| Field | Type |
|-------|------|
| id | Integer (PK) |
| sender_id | Integer (FK: Users) |
| receiver_id | Integer (FK: Users) |
| word | String(50) |
| status | String(20) |
| created_at | DateTime |
