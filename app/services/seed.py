from app import db
from app.models import Achievement

def seed_achievements():
    if Achievement.query.first():
        print("Achievements already seeded")
        return
    
    TROPHY_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ctext y='52' font-size='52'%3E%F0%9F%8F%86%3C/text%3E%3C/svg%3E"
    STREAK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ctext y='52' font-size='52'%3E%F0%9F%94%A5%3C/text%3E%3C/svg%3E"

    achievements = [
        Achievement(
            name="FIRST WIN",
            description="Win your first game",
            condition_type="win_games",
            threshold_value=1,
            image_url=TROPHY_IMG
        ),
        Achievement(
            name="WIN 10 GAMES",
            description="Win 10 games",
            condition_type="win_games",
            threshold_value=10,
            image_url=TROPHY_IMG
        ),
        Achievement(
            name="STREAK 5",
            description="Win 5 games in a row",
            condition_type="streak",
            threshold_value=5,
            image_url=STREAK_IMG
        )
    ]

    db.session.add_all(achievements)
    db.session.commit()