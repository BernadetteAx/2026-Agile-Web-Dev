from app import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False) # Needs hashing
    wins = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    achievements = db.relationship("UserAchievement", backref="user", lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'
    

class DailyWord(db.Model):
    __tablename__ = 'daily_words'

    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(50), unique=True, nullable=False)  # Unique globally to prevent word reuse
    date = db.Column(db.Date, unique=True, nullable=False)  # One word per date

    def __repr__(self):
        return f'<DailyWord {self.word} on {self.date}>'
    
class Achievement(db.Model):
    __tablename__ = "achievements"

    id = db.Column(db.Integer, primary_key=True)

    # human readable
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    users = db.relationship("UserAchievement", backref="achievement", lazy=True)
    image_url = db.Column(db.String(255), nullable=True)

    # logic system
    condition_type = db.Column(db.String(50), nullable=False)
    threshold_value = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return f"<Achievement {self.name}>"
    
class UserAchievement(db.Model):
    __tablename__ = "user_achievements"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey("achievements.id"), nullable=False)

    unlocked_at = db.Column(db.DateTime, server_default=db.func.now())

    # optional: prevents duplicates at DB level
    __table_args__ = (
        db.UniqueConstraint("user_id", "achievement_id"),
    )