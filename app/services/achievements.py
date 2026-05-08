# app/services/achievements.py
from app.models import Friendship

def check_achievement(user, achievement):
    if achievement.condition_type == "win_games":
        return user.wins >= achievement.threshold_value

    if achievement.condition_type == "streak":
        return user.streak >= achievement.threshold_value
    

    if achievement.condition_type == "friends":

        friend_count = Friendship.query.filter(
            (Friendship.user_id == user.id) |
            (Friendship.friend_id == user.id)
        ).count()

        return friend_count >= achievement.threshold_value

    return False

