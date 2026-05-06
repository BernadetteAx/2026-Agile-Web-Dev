# app/services/achievements.py

def check_achievement(user, achievement):
    if achievement.condition_type == "win_games":
        return user.wins >= achievement.threshold_value

    if achievement.condition_type == "streak":
        return user.streak >= achievement.threshold_value

    return False