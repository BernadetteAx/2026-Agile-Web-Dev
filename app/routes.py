from flask import Blueprint, render_template, jsonify, request
from datetime import date
import requests
from app import db
from app.models import DailyWord, Achievement, UserAchievement, User
from app.services.achievements import check_achievement


# Set of routes to be imported into the Flask app by __init__.py
main = Blueprint("main", __name__)


# Format routes like this to add them to the Flask app

#Route for the register page
@main.route("/register")
def register():
    return render_template("register.html")

# Route for the login page
@main.route("/login")
def login():
    return render_template("login.html")

# Route for the confirmation page after registration
@main.route("/confirm")
def confirmation():
    return render_template("confirm.html")

# Routes for the home page 
@main.route("/")
@main.route("/home")
def home():
    return render_template("home.html")

# Route for the daily hangman game page
@main.route("/daily")
def daily_hangman():
    return render_template("daily-page.html")

# Route for the unlimited hangman game page
@main.route("/unlimited")
def unlimited_hangman():
    return render_template("unlimited-page.html")

# Route for the friends page
@main.route("/friends")
def friends():
    return render_template("friend-page.html")

# Route for the achievements page
@main.route("/achievements")
def achievements():
    return render_template("achievements-page.html")

@main.route("/api/achievements")
def get_achievements():

    # TODO: replace with actual user once login is wired up
    class _GuestUser:
        wins = 0
        streak = 0
        achievements = []

    user = _GuestUser

    all_achievements = Achievement.query.all()

    return jsonify([
        {
            "id": a.id,
            "name": a.name,
            "description": a.description,
            "image_url": a.image_url,
            "unlocked": check_achievement(user, a)
        }
        for a in all_achievements
    ])

# Route for the leaderboard page
@main.route("/leaderboard")
def leaderboard():
    return render_template("leaderboard.html")

# API route for fetching the daily word
@main.route("/api/daily-word")
def get_daily_word():
    """
    Fetches or returns the cached daily word for today.
    If no word exists for today, it fetches from the API until finding a unique word that hasn't been used before.
    """
    today = date.today()
    
    # Check if we already have a word for today
    daily_word = DailyWord.query.filter_by(date=today).first()
    if daily_word:
        return jsonify({"word": daily_word.word}), 200
    
    # Fetch a new unique word from the API
    max_retries = 10
    retry_count = 0
    
    try:
        while retry_count < max_retries:
            response = requests.get(
                "https://api.datamuse.com/words?ml=common&max=1000",
                headers={
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "application/json"
                },
                timeout=10
            )
            response.raise_for_status()

            word_list = response.json()

            if not isinstance(word_list, list) or len(word_list) == 0:
                retry_count += 1
                continue

            # pick a random word in the list ONLY ALPHABETICAL CHARACTERS
            valid_words = [w["word"].upper() for w in word_list if w["word"].isalpha()]

            if not valid_words:
                retry_count += 1
                continue

            word = random.choice(valid_words)
            
            # check word alphabetic only
            if not word.isalpha():
                retry_count += 1
                continue
            
            # Check if this word has already been used
            existing_word = DailyWord.query.filter_by(word=word).first()
            if existing_word:
                # Word already used, try again
                retry_count += 1
                continue
            
            # Found a unique word, store it
            new_daily_word = DailyWord(word=word, date=today)
            db.session.add(new_daily_word)
            db.session.commit()
            
            return jsonify({"word": word}), 200
        
        # Failed to find a unique word after max retries
        print(f"Failed to fetch unique daily word after {max_retries} retries")
        return jsonify({"error": "Failed to fetch a unique daily word"}), 500
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching word from API: {e}")
        return jsonify({"error": "Failed to connect to word API"}), 500
    except Exception as e:
        print(f"Unexpected error in get_daily_word: {e}")
        return jsonify({"error": "Internal server error"}), 500
