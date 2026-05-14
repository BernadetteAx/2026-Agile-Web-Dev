from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
 
 
class User(db.Model):
    __tablename__ = 'users'
 
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    wins = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
 
    # Relationships
    achievements = db.relationship("UserAchievement", backref="user", lazy=True)
    daily_states = db.relationship("DailyGameState", backref="user", lazy=True)
    unlimited_states = db.relationship("UnlimitedGameState", backref="user", lazy=True)
    friends = db.relationship('Friendship', foreign_keys='Friendship.user_id', backref='user', lazy=True)

    def set_password(self, raw_password):
        self.password = generate_password_hash(raw_password)
 
    def check_password(self, raw_password):
        return check_password_hash(self.password, raw_password)
 
    def __repr__(self):
        return f'<User {self.username}>'
 
 
class DailyWord(db.Model):
    __tablename__ = 'daily_words'
 
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(50), unique=True, nullable=False)
    date = db.Column(db.Date, unique=True, nullable=False)
 
    def __repr__(self):
        return f'<DailyWord {self.word} on {self.date}>'
 
 
class Achievement(db.Model):
    __tablename__ = "achievements"
 
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(1000), nullable=True)
    condition_type = db.Column(db.String(50), nullable=False)
    threshold_value = db.Column(db.Integer, nullable=True)
 
    users = db.relationship("UserAchievement", backref="achievement", lazy=True)
 
    def __repr__(self):
        return f"<Achievement {self.name}>"
 
 
class UserAchievement(db.Model):
    __tablename__ = "user_achievements"
 
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey("achievements.id"), nullable=False)
    unlocked_at = db.Column(db.DateTime, server_default=db.func.now())
 
    __table_args__ = (
        db.UniqueConstraint("user_id", "achievement_id"),
    )
 
 
class DailyGameState(db.Model):
    """
    One row per guess in the daily hangman game.
    Each time the player guesses a letter, a new snapshot row is inserted.
    The latest row (highest id) represents the current state.
    """
    __tablename__ = "daily_game_states"
 
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
 
    # Which daily word this state belongs to
    daily_word_id = db.Column(db.Integer, db.ForeignKey("daily_words.id"), nullable=False)
 
    # Snapshot fields — recorded on every guess
    guessed_letters = db.Column(db.String(26), nullable=False, default="")   # e.g. "AETROS"
    mistakes = db.Column(db.Integer, nullable=False, default=0)               # 0–6
    time_left = db.Column(db.Integer, nullable=True)                          # seconds remaining (None = no timer)
    hangman_state = db.Column(db.Integer, nullable=False, default=0)          # mirrors mistakes (0–6 parts drawn)
 
    # Outcome — null while in progress
    won = db.Column(db.Boolean, nullable=True)                                # True=win, False=loss, None=in progress
 
    # When this snapshot was taken
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
 
    # Prevent a user playing the same daily word twice
    __table_args__ = (
        db.Index("ix_daily_state_user_word", "user_id", "daily_word_id"),
    )
 
    daily_word = db.relationship("DailyWord", backref="game_states")
 
    def __repr__(self):
        return (
            f"<DailyGameState user={self.user_id} word={self.daily_word_id} "
            f"mistakes={self.mistakes} letters={self.guessed_letters}>"
        )
 
 
class UnlimitedGameState(db.Model):
    """
    Tracks state across unlimited mode games.
    Each row is one complete game session; a new row is inserted when a game starts.
    Rows are updated on every guess (rather than appending) because there's no
    need for a full history per game — just the live snapshot.
 
    If you later want full guess-by-guess history for unlimited too, change the
    save logic to insert instead of upsert (same pattern as DailyGameState).
    """
    __tablename__ = "unlimited_game_states"
 
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
 
    # The word for this session (stored so we can resume mid-game)
    word = db.Column(db.String(50), nullable=False)
 
    # Snapshot fields — updated on every guess
    guessed_letters = db.Column(db.String(26), nullable=False, default="")
    mistakes = db.Column(db.Integer, nullable=False, default=0)
    score = db.Column(db.Integer, nullable=False, default=0)
    time_left = db.Column(db.Integer, nullable=True)
    hangman_state = db.Column(db.Integer, nullable=False, default=0)
 
    # Outcome — null while in progress
    won = db.Column(db.Boolean, nullable=True)
 
    started_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
 
    def __repr__(self):
        return (
            f"<UnlimitedGameState user={self.user_id} word={self.word} "
            f"score={self.score} mistakes={self.mistakes}>"
        )
    
class Friendship(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    friend_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    friend = db.relationship('User', foreign_keys=[friend_id])

class FriendChallenge(db.Model):
    __tablename__ = "friend_challenges"

    id          = db.Column(db.Integer, primary_key=True)
    sender_id   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    word        = db.Column(db.String(50), nullable=False)
    status      = db.Column(db.String(20), nullable=False, default="pending")  # pending >> played
    created_at  = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    sender   = db.relationship("User", foreign_keys=[sender_id])
    receiver = db.relationship("User", foreign_keys=[receiver_id])

    def __repr__(self):
        return f"<FriendChallenge {self.sender_id}→{self.receiver_id} word={self.word} status={self.status}>"