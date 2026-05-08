from app import db
from app.models import Achievement

def seed_achievements():
    existing_names = {a.name for a in Achievement.query.all()}
    new_achievements = [a for a in achievements if a.name not in existing_names]
    if not new_achievements:
        print("All achievements already seeded")
        return
    db.session.add_all(new_achievements)
    db.session.commit()
    print(f"Seeded {len(new_achievements)} new achievements")
    
    achievements = [
        Achievement(
            name="FIRST WIN",
            description="Win your first game",
            condition_type="win_games",
            threshold_value=1,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA2UlEQVR4nO3QQQ7DIAxEUd//0tN1LFUoEYwN/LetGg8/AgCAz1QsqokAtarfH8cHULNB9j0iwDtTXtlpjwjw9Pb32ex7RIA1B1f97+t37QcJkFTvsR8kQFK9x36QAEn1HvtBAiTVe+wHCZBU77Ef3DbAyKyHuPfYD14f4CsCNNsT7oP2B44QIDnt3hABktPuDV0fYDRwtuhOBFgrutPtAf4ZPeSYh/5DgOTt79vTbQE0WexGBJgrdqPbAmjx4PZBRICn3b7ffuB2AVaLbmQW3YgAXtXvBQDEAX6Fs5FCYTw98QAAAABJRU5ErkJggg=="
        ),
        Achievement(
            name="WIN 10 GAMES",
            description="Win 10 games",
            condition_type="win_games",
            threshold_value=10,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAABXUlEQVR4nO2buVIEMQwFxX39/59yw9IkJBZbNTtIsmWsTqem1fsCimREimIIKGQ1qAFaZDX4bwMAB07ncWuALYFkAyN7fZINVh4AOFtuAAxBwIP1Bw0fhME/oAYwvm8GY8Do92X0QZL7pguuAZx94QdS+zjyj4018MiNvH5+D/CVKjC6HzhXgoNnYIcBbP3AhRJ8egZ2GMDWD1wqwYdnYIcBbP3AlRK8ewZ2GMDWD1zXAC1vnoE/Nxqc3bZ+4EYJXmUizP3ArRK8yESY+4E7JXiWiTD3A/dK8CQT8ad+gtm6N7pHeh/c+zy6R3of3Ps8ukd6H9z7PLqnKIqiIfqPRno/2QOj/WQPjPaTPTDaT/bAaD/ZA6P9ZA+M9pM9sLcfZ2F233TBNYCzL/xAdl/4wdHvm6EGaJntfTOsPoCmvhcwstcn2WDlAVjxewELHt8LTA81QIusBqsPUEgOvgH4roQzKDEJHgAAAABJRU5ErkJggg=="
        ),
        Achievement(
            name="STREAK 5",
            description="Win 5 games in a row",
            condition_type="streak",
            threshold_value=5,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA4ElEQVR4nO2QMRLDQAgD+f+nSW2KEMYcEfZue7Yk1gwAAADgRzxQfVfvS0HA8KDpvhQEBLZ9fxsXOwgBATuNFwvVvm/HkwHdB/394AgCAtl7lWrfOI6AK9l7lWrfOI6A76jnm/pABCT0XCE8cJ0Ae1hfCgICqv8dw98mwJsGqOWsHY6AppzxQrWctcMR0JQzXqiWs3Y4AppyxgvVctYOR0BTznihWs7a4QhoyhkvVMux6QHT/x3DEXDlaX1yg+QEnB4of3AEAQG1vOP42wVkB1Sx7TgC7mHb8bcLAAAA0+UD1V2111HaWt0AAAAASUVORK5CYII="
        ),
        Achievement(
            name="WIN 25 GAMES",
            description="Win 25 games",
            condition_type="win_games",
            threshold_value=25,
            image_url=None
        ),
        Achievement(
            name="WIN 50 GAMES",
            description="Win 50 games",
            condition_type="win_games",
            threshold_value=50,
            image_url=None
        ),
        Achievement(
            name="WIN 100 GAMES",
            description="Win 100 games",
            condition_type="win_games",
            threshold_value=100,
            image_url=None
        ),
        Achievement(
            name="STREAK 3",
            description="Win 3 games in a row",
            condition_type="streak",
            threshold_value=3,
            image_url=None
        ),
        Achievement(
            name="STREAK 10",
            description="Win 10 games in a row",
            condition_type="streak",
            threshold_value=10,
            image_url=None
        ),
        Achievement(
            name="STREAK 25",
            description="Win 25 games in a row",
            condition_type="streak",
            threshold_value=25,
            image_url=None
        ),
        Achievement(
            name="FLAWLESS",
            description="Win a game without a single mistake",
            condition_type="no_mistakes",
            threshold_value=1,
            image_url=None
        ),
        Achievement(
            name="SPEED DEMON",
            description="Win a game with over 60 seconds remaining",
            condition_type="time_left",
            threshold_value=60,
            image_url=None
        ),
        Achievement(
            name="DAILY DEVOTEE",
            description="Complete 7 daily games",
            condition_type="daily_wins",
            threshold_value=7,
            image_url=None
        ),
        Achievement(
            name="SOCIAL",
            description="Add your first friend",
            condition_type="friends",
            threshold_value=1,
            image_url=None
        )
    ]

    db.session.add_all(achievements)
    db.session.commit()