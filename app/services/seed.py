from app import db
from app.models import Achievement

def seed_achievements():
    if Achievement.query.first():
        print("Achievements already seeded")
        return

    achievements = [
        Achievement(
            name="FIRST WIN",
            description="Win your first game",
            condition_type="win_games",
            threshold_value=1
        ),
        Achievement(
            name="WIN 10 GAMES",
            description="Win 10 games",
            condition_type="win_games",
            threshold_value=10
        ),
        Achievement(
            name="STREAK 5",
            description="Win 5 games in a row",
            condition_type="streak",
            threshold_value=5
        )
    ]

    db.session.add_all(achievements)
    db.session.commit()