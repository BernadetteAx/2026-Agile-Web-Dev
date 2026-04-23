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