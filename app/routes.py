from flask import Blueprint, render_template, jsonify, request, session
from datetime import date, datetime
import requests
import random

from app import db
from app.models import DailyWord, Achievement, UserAchievement, User, DailyGameState, UnlimitedGameState
from app.services.achievements import check_achievement
from app.decorators import login_required

main = Blueprint("main", __name__)


# public pages (no login required)

@main.route("/register")
def register():
    return render_template("register.html")


@main.route("/login")
def login():
    return render_template("login.html")

# protected pages (redirect to login)

@main.route("/")
@main.route("/home")
@login_required
def home():
    return render_template("home.html")


@main.route("/daily")
@login_required
def daily_hangman():
    return render_template("daily-page.html")


@main.route("/unlimited")
@login_required
def unlimited_hangman():
    return render_template("unlimited-page.html")


@main.route("/friends")
@login_required
def friends():
    return render_template("friend-page.html")


@main.route("/achievements")
@login_required
def achievements():
    return render_template("achievements-page.html")


@main.route("/leaderboard")
@login_required
def leaderboard():
    return render_template("leaderboard.html")


# achievements API

@main.route("/api/achievements")
@login_required
def get_achievements():
    user = User.query.get(session["user_id"])
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


# daily word API

@main.route("/api/daily-word")
@login_required
def get_daily_word():
    """
    Fetches or returns the cached daily word for today.
    Also returns the player's current saved state for that word (if any),
    so the frontend can resume a game in progress.
    """
    today = date.today()
    daily_word = DailyWord.query.filter_by(date=today).first()

    if not daily_word:
        daily_word = _fetch_and_store_daily_word(today)
        if daily_word is None:
            return jsonify({"error": "Failed to fetch a unique daily word"}), 500

    # Load the user's latest state for today's word (most recent snapshot)
    user_id = session["user_id"]
    latest_state = (
        DailyGameState.query
        .filter_by(user_id=user_id, daily_word_id=daily_word.id)
        .order_by(DailyGameState.id.desc())
        .first()
    )

    saved_state = None
    if latest_state:
        saved_state = {
            "guessed_letters": list(latest_state.guessed_letters),
            "mistakes": latest_state.mistakes,
            "time_left": latest_state.time_left,
            "hangman_state": latest_state.hangman_state,
            "won": latest_state.won,
        }

    return jsonify({
        "word": daily_word.word,
        "saved_state": saved_state,
    }), 200


def _fetch_and_store_daily_word(today):
    """Helper: hit the Datamuse API and store a new unique daily word."""
    max_retries = 10
    for _ in range(max_retries):
        try:
            response = requests.get(
                "https://api.datamuse.com/words?ml=common&max=1000",
                headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"},
                timeout=10,
            )
            response.raise_for_status()
            word_list = response.json()
        except requests.exceptions.RequestException:
            continue

        if not isinstance(word_list, list) or not word_list:
            continue

        valid_words = [w["word"].upper() for w in word_list if w["word"].isalpha()]
        if not valid_words:
            continue

        word = random.choice(valid_words)
        if DailyWord.query.filter_by(word=word).first():
            continue  # already used

        new_daily_word = DailyWord(word=word, date=today)
        db.session.add(new_daily_word)
        db.session.commit()
        return new_daily_word

    return None


# daily game state API

@main.route("/api/daily-state", methods=["POST"])
@login_required
def save_daily_state():
    """
    Called by the frontend every time the player guesses a letter.
    Inserts a new snapshot row — this gives you a full guess-by-guess history.

    Expected JSON:
    {
        "daily_word_id": 3,
        "guessed_letters": "AETRO",   // all letters guessed so far, string
        "mistakes": 2,
        "time_left": 87,              // seconds remaining, or null
        "hangman_state": 2,
        "won": null                   // null=in progress, true=won, false=lost
    }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    required = {"daily_word_id", "guessed_letters", "mistakes", "hangman_state"}
    if not required.issubset(data.keys()):
        return jsonify({"error": f"Missing fields: {required - data.keys()}"}), 400

    # verify the daily word exists
    daily_word = DailyWord.query.get(data["daily_word_id"])
    if not daily_word:
        return jsonify({"error": "Invalid daily_word_id"}), 404

    user_id = session["user_id"]

    snapshot = DailyGameState(
        user_id=user_id,
        daily_word_id=daily_word.id,
        guessed_letters=data["guessed_letters"].upper(),
        mistakes=int(data["mistakes"]),
        time_left=data.get("time_left"),          # optional
        hangman_state=int(data["hangman_state"]),
        won=data.get("won"),                       # None / True / False
        timestamp=datetime.utcnow(),
    )
    db.session.add(snapshot)

    # if the game just ended with a win, update the user's stats
    if data.get("won") is True:
        user = User.query.get(user_id)
        user.wins += 1
        user.streak += 1

    elif data.get("won") is False:
        user = User.query.get(user_id)
        user.streak = 0   # loss breaks the streak

    db.session.commit()
    return jsonify({"message": "State saved", "id": snapshot.id}), 201


@main.route("/api/daily-state/<int:daily_word_id>")
@login_required
def get_daily_state_history(daily_word_id):
    """
    Returns every saved snapshot for the current user + given daily word.
    Useful for replays or debugging; the frontend normally only needs the
    latest snapshot (returned by /api/daily-word).
    """
    user_id = session["user_id"]
    snapshots = (
        DailyGameState.query
        .filter_by(user_id=user_id, daily_word_id=daily_word_id)
        .order_by(DailyGameState.id.asc())
        .all()
    )

    return jsonify([
        {
            "id": s.id,
            "guessed_letters": list(s.guessed_letters),
            "mistakes": s.mistakes,
            "time_left": s.time_left,
            "hangman_state": s.hangman_state,
            "won": s.won,
            "timestamp": s.timestamp.isoformat(),
        }
        for s in snapshots
    ]), 200


# Unlimited game state API

@main.route("/api/unlimited-state", methods=["POST"])
@login_required
def save_unlimited_state():
    """
    Called by the frontend every time the player guesses a letter in unlimited mode.
    
    Pass `game_id: null` to START a new game — the server will create a row and
    return its id. On every subsequent guess pass the same `game_id` to update
    that row in place.

    Expected JSON:
    {
        "game_id": null,              // null = new game, integer = update existing
        "word": "PYTHON",            // only required when game_id is null
        "guessed_letters": "AEYP",
        "mistakes": 1,
        "score": 120,
        "time_left": 55,
        "hangman_state": 1,
        "won": null
    }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    user_id = session["user_id"]
    game_id = data.get("game_id")

    if game_id:
        # Update existing game row
        game = UnlimitedGameState.query.filter_by(id=game_id, user_id=user_id).first()
        if not game:
            return jsonify({"error": "Game not found or access denied"}), 404

        game.guessed_letters = data.get("guessed_letters", game.guessed_letters).upper()
        game.mistakes        = int(data.get("mistakes", game.mistakes))
        game.score           = int(data.get("score", game.score))
        game.time_left       = data.get("time_left", game.time_left)
        game.hangman_state   = int(data.get("hangman_state", game.hangman_state))
        game.won             = data.get("won", game.won)
        game.updated_at      = datetime.utcnow()

    else:
        # start a new game
        word = (data.get("word") or "").upper()
        if not word or not word.isalpha():
            return jsonify({"error": "A valid 'word' is required to start a new game"}), 400

        game = UnlimitedGameState(
            user_id=user_id,
            word=word,
            guessed_letters=data.get("guessed_letters", "").upper(),
            mistakes=int(data.get("mistakes", 0)),
            score=int(data.get("score", 0)),
            time_left=data.get("time_left"),
            hangman_state=int(data.get("hangman_state", 0)),
            won=data.get("won"),
        )
        db.session.add(game)

    # update user stats on win
    if data.get("won") is True:
        user = User.query.get(user_id)
        user.wins += 1
        user.streak += 1
    elif data.get("won") is False:
        user = User.query.get(user_id)
        user.streak = 0

    db.session.commit()
    return jsonify({"message": "State saved", "game_id": game.id}), 200 if game_id else 201


@main.route("/api/unlimited-state/active")
@login_required
def get_active_unlimited_game():
    """
    Returns the most recent in-progress unlimited game for the current user,
    so the frontend can offer to resume it on page load.
    """
    user_id = session["user_id"]
    game = (
        UnlimitedGameState.query
        .filter_by(user_id=user_id, won=None)
        .order_by(UnlimitedGameState.id.desc())
        .first()
    )

    if not game:
        return jsonify({"active_game": None}), 200

    return jsonify({
        "active_game": {
            "game_id": game.id,
            "word": game.word,
            "guessed_letters": list(game.guessed_letters),
            "mistakes": game.mistakes,
            "score": game.score,
            "time_left": game.time_left,
            "hangman_state": game.hangman_state,
        }
    }), 200

@main.route("/api/random-word")
@login_required
def get_random_word():
    try:
        response = requests.get(
            "https://api.datamuse.com/words?ml=common&max=1000",
            headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"},
            timeout=10,
        )
        response.raise_for_status()
        word_list = response.json()
        valid_words = [w["word"].upper() for w in word_list if w["word"].isalpha()]
        if not valid_words:
            return jsonify({"error": "No valid words found"}), 500
        word = random.choice(valid_words)
        return jsonify({"word": word}), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch word"}), 500