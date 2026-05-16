from flask import Blueprint, render_template, jsonify, request, session
from datetime import date, datetime
import random
import requests

from app import db
from app.models import DailyWord, Achievement, UserAchievement, User, DailyGameState, UnlimitedGameState, Friendship, FriendChallenge
from app.services.achievements import check_achievement
from app.services.words import get_random_word as get_word_from_list
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

    users = User.query.all()

    users_data = [
        {"name": u.username.upper(), "wins": u.wins}
        for u in users
    ]

    return render_template("friend-page.html", users=users_data)

@main.route("/api/add-friend", methods=["POST"])
@login_required
def add_friend():
    data = request.get_json()
    user_id = session["user_id"]
    friend_name = data.get("name", "").upper()

    friend = User.query.filter(db.func.upper(User.username) == friend_name).first()

    if not friend:
        return jsonify({"error": "User not found"}), 404

    if friend.id == user_id:
        return jsonify({"error": "Cannot add yourself"}), 400

    existing = Friendship.query.filter_by(
        user_id=user_id,
        friend_id=friend.id
    ).first()

    if existing:
        return jsonify({"error": "Already friends"}), 400

    new_friendship = Friendship(
        user_id=user_id,
        friend_id=friend.id
    )

    db.session.add(new_friendship)
    db.session.commit()

    user = User.query.get(user_id)

    achievements = Achievement.query.all()

    for achievement in achievements:
        already_unlocked = UserAchievement.query.filter_by(
            user_id=user.id,
            achievement_id=achievement.id
        ).first()

        if not already_unlocked and check_achievement(user, achievement):
            db.session.add(UserAchievement(
                user_id=user.id,
                achievement_id=achievement.id
            ))

    db.session.commit()

    return jsonify({"message": "Friend added"}), 200

@main.route("/api/friends")
@login_required
def get_friends():
    user_id = session["user_id"]
    friendships = Friendship.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            "name": f.friend.username.upper(),
            "wins": f.friend.wins
        }
        for f in friendships
    ])

@main.route("/api/users/search")
@login_required
def search_users():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify([]), 200

    current_user_id = session["user_id"]

    users = User.query.filter(
        User.username.ilike(f"%{q}%"),
        User.id != current_user_id
    ).limit(8).all()

    return jsonify([
        {"username": u.username, "wins": u.wins}
        for u in users
    ])

@main.route("/achievements")
@login_required
def achievements():
    return render_template("achievements-page.html")


@main.route("/leaderboard")
@login_required
def leaderboard():
    return render_template("leaderboard.html")


# leaderboard API

@main.route("/api/leaderboard")
@login_required
def api_leaderboard():
    mode = request.args.get("mode", "daily")
    sort_by = request.args.get("sort", "dailyScore")

    if mode == "daily":
        return build_daily_leaderboard(sort_by)

    if mode == "unlimited":
        return build_unlimited_leaderboard(sort_by)

    return jsonify({"error": "Invalid leaderboard mode"}), 400

def build_daily_leaderboard(sort_by):
    today = date.today()
    daily_word = DailyWord.query.filter_by(date=today).first()

    if not daily_word:
        return jsonify([]), 200

    states = (
        DailyGameState.query
        .filter(
            DailyGameState.daily_word_id == daily_word.id,
            DailyGameState.won.isnot(None)
        )
        .order_by(DailyGameState.id.desc())
        .all()
    )

    rows = []
    used_users = set()

    for state in states:
        if state.user_id in used_users:
            continue

        used_users.add(state.user_id)

        time_left = state.time_left or 0
        score = 100 + time_left - state.mistakes * 15

        rows.append({
            "username": state.user.username.upper(),
            "score": score,
            "mistakes": state.mistakes,
            "timeLeft": time_left
        })

    if sort_by == "mistakes":
        rows.sort(key=lambda row: (row["mistakes"], -row["timeLeft"]))
    elif sort_by == "timeLeft":
        rows.sort(key=lambda row: (-row["timeLeft"], row["mistakes"]))
    else:
        rows.sort(key=lambda row: (-row["score"], row["mistakes"], -row["timeLeft"]))

    for index, row in enumerate(rows):
        row["rank"] = index + 1

    return jsonify(rows), 200


def build_unlimited_leaderboard(sort_by):
    games = (
        UnlimitedGameState.query
        .filter(UnlimitedGameState.won.isnot(None))
        .order_by(UnlimitedGameState.user_id, UnlimitedGameState.started_at)
        .all()
    )

    games_by_user = {}

    for game in games:
        if game.user_id not in games_by_user:
            games_by_user[game.user_id] = []

        games_by_user[game.user_id].append(game)

    rows = []

    for user_id, user_games in games_by_user.items():
        user = User.query.get(user_id)

        total_games = len(user_games)
        total_words = 0
        current_streak = 0
        best_streak = 0

        for game in user_games:
            if game.won:
                total_words += 1
                current_streak += 1

                if current_streak > best_streak:
                    best_streak = current_streak
            else:
                current_streak = 0

        rows.append({
            "username": user.username.upper(),
            "bestStreak": best_streak,
            "totalWords": total_words,
            "games": total_games
        })
        
    if sort_by == "totalWords":
        rows.sort(key=lambda row: (-row["totalWords"], -row["bestStreak"], -row["games"]))
    elif sort_by == "games":
        rows.sort(key=lambda row: (-row["games"], -row["bestStreak"], -row["totalWords"]))
    else:
        rows.sort(key=lambda row: (-row["bestStreak"], -row["totalWords"], -row["games"]))

    for index, row in enumerate(rows):
        row["rank"] = index + 1

    return jsonify(rows), 200


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


# Helper function to fetch word definition and part of speech
def get_word_definition(word):
    """
    Fetch definition and part of speech for a word from the Dictionary API.

    Args:
        word (str): The word to look up

    Returns:
        dict: Contains 'definition' and 'part_of_speech' or empty strings if fetch fails
    """
    try:
        response = requests.get(
            f"https://api.dictionaryapi.dev/api/v2/entries/en/{word.lower()}",
            timeout=5
        )
        response.raise_for_status()
        data = response.json()

        if data and len(data) > 0:
            meanings = data[0].get('meanings', [])
            if meanings:
                first_meaning = meanings[0]
                part_of_speech = first_meaning.get('partOfSpeech', '')
                definitions = first_meaning.get('definitions', [])
                definition = definitions[0].get('definition', '') if definitions else ''
                return {
                    'definition': definition,
                    'part_of_speech': part_of_speech
                }
    except (requests.exceptions.RequestException, ValueError, IndexError, KeyError):
        pass

    return {'definition': '', 'part_of_speech': ''}


def _word_exists_in_dictionary(word):
    """Return True when the Dictionary API has usable data for the word."""
    word_info = get_word_definition(word)
    return bool(word_info["definition"] or word_info["part_of_speech"])


def _get_dictionary_word_from_list(max_retries=10, excluded_words=None):
    """Choose a local word that also exists in the dictionary API."""
    checked_words = set(excluded_words or [])

    for _ in range(max_retries):
        word = get_word_from_list()

        if word in checked_words:
            continue

        checked_words.add(word)

        if _word_exists_in_dictionary(word):
            return word

    return None


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

    # Fetch word definition and part of speech
    word_info = get_word_definition(daily_word.word)

    return jsonify({
        "word": daily_word.word,
        "daily_word_id": daily_word.id,
        "definition": word_info['definition'],
        "part_of_speech": word_info['part_of_speech'],
        "saved_state": saved_state,
    }), 200


def _fetch_and_store_daily_word(today):
    """Helper: load and store a new unique daily word that exists in the dictionary."""
    used_words = {
        word
        for (word,) in DailyWord.query.with_entities(DailyWord.word).all()
    }

    try:
        word = _get_dictionary_word_from_list(excluded_words=used_words)
    except Exception:
        return None

    if word is None:
        return None

    new_daily_word = DailyWord(word=word, date=today)
    db.session.add(new_daily_word)
    db.session.commit()
    return new_daily_word


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

    user = User.query.get(user_id)

    achievements = Achievement.query.all()

    for achievement in achievements:
        already_unlocked = UserAchievement.query.filter_by(
            user_id=user.id,
            achievement_id=achievement.id
        ).first()

        if already_unlocked:
            continue

        if achievement.condition_type == "no_mistakes":
            if int(data.get("mistakes", 0)) == 0:
                db.session.add(UserAchievement(user_id=user.id, achievement_id=achievement.id))

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

    challenge_id = data.get("challenge_id")

    # only update streak/wins for real games, not challenges
    if not challenge_id:
        if data.get("won") is True:
            user = User.query.get(user_id)
            user.wins += 1
            user.streak += 1
        elif data.get("won") is False:
            user = User.query.get(user_id)
            user.streak = 0
    else:
        # mark the challenge as played when the game ends
        if data.get("won") is not None:
            challenge = FriendChallenge.query.filter_by(
                id=int(challenge_id),
                receiver_id=user_id
            ).first()
            if challenge:
                challenge.status = "played"

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
        word = _get_dictionary_word_from_list()
        if word is None:
            return jsonify({"error": "Failed to get dictionary word"}), 500
        return jsonify({"word": word}), 200
    except Exception as e:
        return jsonify({"error": "Failed to get word"}), 500
    

@main.route("/api/challenge/send", methods=["POST"])
@login_required
def send_challenge():
    """
    Send a word challenge to a friend.

    Expected JSON:
    {
        "friend_username": "ALICE",
        "word": "PYTHON"          // 4-8 alpha chars
    }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    sender_id = session["user_id"]
    friend_name = (data.get("friend_username") or "").strip()
    word = (data.get("word") or "").strip().upper()

    if not friend_name:
        return jsonify({"error": "friend_username is required"}), 400

    if not word or not word.isalpha() or not (4 <= len(word) <= 8):
        return jsonify({"error": "Word must be 4-8 letters (alpha only)"}), 400

    # Receiver must exist
    receiver = User.query.filter(
        db.func.upper(User.username) == friend_name.upper()
    ).first()
    if not receiver:
        return jsonify({"error": "User not found"}), 404

    if receiver.id == sender_id:
        return jsonify({"error": "Cannot challenge yourself"}), 400

    # They must actually be friends (sender → receiver)
    friendship = Friendship.query.filter_by(
        user_id=sender_id, friend_id=receiver.id
    ).first()
    if not friendship:
        return jsonify({"error": "You can only challenge friends"}), 403

    challenge = FriendChallenge(
        sender_id=sender_id,
        receiver_id=receiver.id,
        word=word,
    )
    db.session.add(challenge)
    db.session.commit()

    return jsonify({"message": "Challenge sent", "challenge_id": challenge.id}), 201

# returns all pending challenges addressed to the current user
@main.route("/api/challenge/inbox")
@login_required
def challenge_inbox():
    user_id = session["user_id"]
    challenges = (
        FriendChallenge.query
        .filter_by(receiver_id=user_id, status="pending")
        .order_by(FriendChallenge.created_at.desc())
        .all()
    )

    return jsonify([
        {
            "challenge_id": c.id,
            "from": c.sender.username.upper(),
            "word_length": len(c.word),   # don't reveal the word yet
            "sent_at": c.created_at.isoformat(),
        }
        for c in challenges
    ]), 200

# returns the challenge word so the unlimited-hangman page can load it
@main.route("/api/challenge/<int:challenge_id>")
@login_required
def get_challenge(challenge_id):

    user_id = session["user_id"]
    challenge = FriendChallenge.query.get_or_404(challenge_id)

    if challenge.receiver_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({
        "challenge_id": challenge.id,
        "word": challenge.word,
        "from": challenge.sender.username.upper(),
        "status": challenge.status,
    }), 200
