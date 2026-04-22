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

## Running the Application

Set the Flask app environment variable and start the development server.

On Mac and Linux:
```
$ export FLASK_APP=app.py
$ flask run
```

On Windows:
```
$ set FLASK_APP=app.py
$ flask run
```

The app will be available at `http://127.0.0.1:5000` by default.

---

## Running the Tests

Open the root directory of the project in a terminal and enter:
```
$ python -m unittest discover
```

> **Note:** Ensure that the virtual environment is **not** active when running the automated tests, as it may cause errors.

---

## Deployment

To configure the application for deployment, set the required environment variables:

On Mac and Linux:
```
$ export FLASK_APP=app.py
$ export FLASK_ENV=production
```

If any additional environment variables are required (e.g. secret keys or mail credentials), set them as follows:
```
$ export SECRET_KEY=<your-secret-key>
$ export MAIL_PASSWORD=<your-mail-server-password>
```

Then start the server:
```
$ flask run
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

- HTML
- CSS
- JavaScript
- Python 3
- [Flask](https://flask.palletsprojects.com/) – web framework
- Bootstrap – front-end styling

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

## Application Design

### Main Pages

| Page | Description |
|------|-------------|
| Home | Intro screen with a "Play Now" button |
| Login | User login form |
| Signup | New account registration |
| Dashboard | Welcome screen with links to start a game, view the leaderboard, and view history |
| Game | Word display (`_ _ _ _`), letter keyboard, hangman drawing, and score |
| Leaderboard | Top players ranked by score |
| Create Word | Form for users to submit custom words |
| Profile | User stats including games played, wins, and losses |

### UI Layout

- Navigation bar: Home | Play | Leaderboard | Profile | Logout
- Large centered game area
- A–Z letter buttons for input
- Hangman image updates dynamically with each incorrect guess


---

## Database Schema

### Users
| Field         | Type    |
|---------------|---------|
| user_id       | Integer |
| username      | String  |
| password_hash | String  |
| score         | Integer |
| games_played  | Integer |

### Games
| Field        | Type          |
|--------------|---------------|
| game_id      | Integer       |
| user_id      | Integer (FK)  |
| word         | String        |
| result       | win / lose    |
| guesses_used | Integer       |

### Words
| Field      | Type         |
|------------|--------------|
| word_id    | Integer      |
| word_text  | String       |
| created_by | Integer (FK) |

### Scores
| Field       | Type         |
|-------------|--------------|
| score_id    | Integer      |
| user_id     | Integer (FK) |
| score_value | Integer      |
| timestamp   | DateTime     |

