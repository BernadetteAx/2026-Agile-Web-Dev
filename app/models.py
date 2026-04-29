from app import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False) # Needs hashing
    wins = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<User {self.username}>'
    

class DailyWord(db.Model):
    __tablename__ = 'daily_words'

    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(50), unique=True, nullable=False)  # Unique globally to prevent word reuse
    date = db.Column(db.Date, unique=True, nullable=False)  # One word per date

    def __repr__(self):
        return f'<DailyWord {self.word} on {self.date}>'