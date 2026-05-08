"""
Unit Tests for Hangman Flask App
Run with: python -m pytest tests/test_unit.py -v
"""

import pytest
from unittest.mock import patch, MagicMock
from datetime import date

# app fixture
@pytest.fixture
def app():
    """Create a test Flask app with an in-memory SQLite database."""
    from app import create_app, db

    test_app = create_app()
    test_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SECRET_KEY": "test-secret-key",
        "WTF_CSRF_ENABLED": False,
    })

    with test_app.app_context():
        db.create_all()
        yield test_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def db_session(app):
    from app import db
    return db.session


# helper (create a user directly in the DB)
def create_user(db_session, username="testuser", email="test@test.com", password="password1", wins=0, streak=0):
    from app.models import User
    user = User(username=username, email=email, wins=wins, streak=streak)
    user.set_password(password)
    db_session.add(user)
    db_session.commit()
    return user


def login(client, email="test@test.com", password="password1"):
    return client.post("/api/auth/login", json={"email": email, "password": password})

# user model tests
class TestUserModel:

    def test_password_is_hashed(self, app, db_session):
        """Password should never be stored as plaintext."""
        user = create_user(db_session)
        assert user.password != "password1"

    def test_check_password_correct(self, app, db_session):
        """check_password should return True for the correct password."""
        user = create_user(db_session)
        assert user.check_password("password1") is True

    def test_check_password_wrong(self, app, db_session):
        """check_password should return False for the wrong password."""
        user = create_user(db_session)
        assert user.check_password("wrongpassword") is False

    def test_user_defaults(self, app, db_session):
        """New users should have 0 wins and 0 streak."""
        user = create_user(db_session)
        assert user.wins == 0
        assert user.streak == 0

    def test_username_is_unique(self, app, db_session):
        """Two users cannot share the same username."""
        from app import db
        from sqlalchemy.exc import IntegrityError
        create_user(db_session, username="dupeuser", email="a@a.com")
        with pytest.raises(IntegrityError):
            create_user(db_session, username="dupeuser", email="b@b.com")

    def test_email_is_unique(self, app, db_session):
        """Two users cannot share the same email."""
        from app import db
        from sqlalchemy.exc import IntegrityError
        create_user(db_session, username="user1", email="same@same.com")
        with pytest.raises(IntegrityError):
            create_user(db_session, username="user2", email="same@same.com")

# auth route tests
class TestAuthRoutes:

    def test_register_success(self, app, client):
        """Valid registration should return 201 and create a user."""
        res = client.post("/api/auth/register", json={
            "username": "newuser",
            "email": "new@test.com",
            "password": "password1"
        })
        assert res.status_code == 201
        assert res.get_json()["username"] == "newuser"

    def test_register_missing_fields(self, app, client):
        """Registration without all fields should return 400."""
        res = client.post("/api/auth/register", json={"email": "x@x.com"})
        assert res.status_code == 400

    def test_register_short_password(self, app, client):
        """Password under 8 characters should be rejected."""
        res = client.post("/api/auth/register", json={
            "username": "shortpw",
            "email": "short@test.com",
            "password": "abc1"
        })
        assert res.status_code == 400

    def test_register_duplicate_email(self, app, client, db_session):
        """Registering with an existing email should return 400."""
        create_user(db_session)
        res = client.post("/api/auth/register", json={
            "username": "another",
            "email": "test@test.com",
            "password": "password1"
        })
        assert res.status_code == 400

    def test_register_duplicate_username(self, app, client, db_session):
        """Registering with an existing username should return 400."""
        create_user(db_session)
        res = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "different@test.com",
            "password": "password1"
        })
        assert res.status_code == 400

    def test_login_success(self, app, client, db_session):
        """Valid credentials should return 200."""
        create_user(db_session)
        res = login(client)
        assert res.status_code == 200
        assert "username" in res.get_json()

    def test_login_wrong_password(self, app, client, db_session):
        """Wrong password should return 401."""
        create_user(db_session)
        res = client.post("/api/auth/login", json={
            "email": "test@test.com",
            "password": "wrongpassword"
        })
        assert res.status_code == 401

    def test_login_nonexistent_user(self, app, client):
        """Login with unknown email should return 401."""
        res = client.post("/api/auth/login", json={
            "email": "nobody@test.com",
            "password": "password1"
        })
        assert res.status_code == 401

    def test_logout(self, app, client, db_session):
        """Logout should return 200 and clear the session."""
        create_user(db_session)
        login(client)
        res = client.post("/api/auth/logout")
        assert res.status_code == 200

    def test_me_authenticated(self, app, client, db_session):
        """Authenticated /api/auth/me should return user info."""
        create_user(db_session)
        login(client)
        res = client.get("/api/auth/me")
        assert res.status_code == 200
        data = res.get_json()
        assert data["username"] == "testuser"
        assert "email" not in data  # email should not be exposed

    def test_me_unauthenticated(self, app, client):
        """/api/auth/me should return 401 when not logged in."""
        res = client.get("/api/auth/me")
        assert res.status_code == 401

# protected route tests
class TestProtectedRoutes:

    def test_home_redirects_when_not_logged_in(self, app, client):
        """Home page should redirect to login if not authenticated."""
        res = client.get("/home")
        assert res.status_code == 302
        assert "/login" in res.headers["Location"]

    def test_daily_redirects_when_not_logged_in(self, app, client):
        """Daily page should redirect to login if not authenticated."""
        res = client.get("/daily")
        assert res.status_code == 302

    def test_achievements_redirects_when_not_logged_in(self, app, client):
        """Achievements page should redirect to login if not authenticated."""
        res = client.get("/achievements")
        assert res.status_code == 302

    def test_home_accessible_when_logged_in(self, app, client, db_session):
        """Home page should be accessible when authenticated."""
        create_user(db_session)
        login(client)
        res = client.get("/home")
        assert res.status_code == 200

    def test_api_achievements_requires_login(self, app, client):
        """/api/achievements should return 401 when not logged in."""
        res = client.get("/api/achievements")
        assert res.status_code == 401

# achievement logic tests
class TestAchievementLogic:

    def test_win_games_achievement_unlocked(self, app, db_session):
        """Win achievement should unlock when user has enough wins."""
        from app.models import Achievement
        from app.services.achievements import check_achievement

        user = create_user(db_session, wins=5)
        achievement = Achievement(
            name="WIN 5",
            description="Win 5 games",
            condition_type="win_games",
            threshold_value=5
        )
        assert check_achievement(user, achievement) is True

    def test_win_games_achievement_locked(self, app, db_session):
        """Win achievement should not unlock when user has too few wins."""
        from app.models import Achievement
        from app.services.achievements import check_achievement

        user = create_user(db_session, wins=3)
        achievement = Achievement(
            name="WIN 10",
            description="Win 10 games",
            condition_type="win_games",
            threshold_value=10
        )
        assert check_achievement(user, achievement) is False

    def test_streak_achievement_unlocked(self, app, db_session):
        """Streak achievement should unlock when user has enough streak."""
        from app.models import Achievement
        from app.services.achievements import check_achievement

        user = create_user(db_session, streak=5)
        achievement = Achievement(
            name="STREAK 5",
            description="5 in a row",
            condition_type="streak",
            threshold_value=5
        )
        assert check_achievement(user, achievement) is True

    def test_streak_achievement_locked(self, app, db_session):
        """Streak achievement should not unlock when streak is too low."""
        from app.models import Achievement
        from app.services.achievements import check_achievement

        user = create_user(db_session, streak=2)
        achievement = Achievement(
            name="STREAK 5",
            description="5 in a row",
            condition_type="streak",
            threshold_value=5
        )
        assert check_achievement(user, achievement) is False

    def test_unknown_condition_returns_false(self, app, db_session):
        """Unknown condition types should return False safely."""
        from app.models import Achievement
        from app.services.achievements import check_achievement

        user = create_user(db_session)
        achievement = Achievement(
            name="MYSTERY",
            description="???",
            condition_type="unknown_condition",
            threshold_value=1
        )
        assert check_achievement(user, achievement) is False

# daily word API tests
class TestDailyWordAPI:

    def test_daily_word_requires_login(self, app, client):
        """/api/daily-word should return 401 when not logged in."""
        res = client.get("/api/daily-word")
        assert res.status_code == 401

    @patch("app.routes.requests.get")
    def test_daily_word_returns_word(self, mock_get, app, client, db_session):
        """Daily word endpoint should return a word when logged in."""
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {"word": "python"}, {"word": "flask"}, {"word": "hangman"}
        ]
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        create_user(db_session)
        login(client)

        res = client.get("/api/daily-word")
        assert res.status_code == 200
        data = res.get_json()
        assert "word" in data
        assert "daily_word_id" in data

    @patch("app.routes.requests.get")
    def test_same_word_returned_for_today(self, mock_get, app, client, db_session):
        """Same word should be returned on repeated calls for the same day."""
        from app.models import DailyWord
        from app import db

        # Pre-seed today's word
        today_word = DailyWord(word="PYTHON", date=date.today())
        db.session.add(today_word)
        db.session.commit()

        create_user(db_session)
        login(client)

        res1 = client.get("/api/daily-word")
        res2 = client.get("/api/daily-word")

        assert res1.get_json()["word"] == res2.get_json()["word"]
        # Datamuse should NOT have been called since word already exists
        mock_get.assert_not_called()

# daily game state tests
class TestDailyGameState:

    def _seed_daily_word(self, db_session):
        from app.models import DailyWord
        from app import db
        dw = DailyWord(word="PYTHON", date=date.today())
        db.session.add(dw)
        db.session.commit()
        return dw

    def test_save_state_requires_login(self, app, client):
        res = client.post("/api/daily-state", json={})
        assert res.status_code == 401

    def test_save_state_success(self, app, client, db_session):
        """Saving a valid game state should return 201."""
        dw = self._seed_daily_word(db_session)
        create_user(db_session)
        login(client)

        res = client.post("/api/daily-state", json={
            "daily_word_id": dw.id,
            "guessed_letters": "PY",
            "mistakes": 1,
            "time_left": 80,
            "hangman_state": 1,
            "won": None
        })
        assert res.status_code == 201

    def test_save_state_updates_wins_on_win(self, app, client, db_session):
        """Saving a win should increment user.wins."""
        from app.models import User
        dw = self._seed_daily_word(db_session)
        user = create_user(db_session)
        login(client)

        client.post("/api/daily-state", json={
            "daily_word_id": dw.id,
            "guessed_letters": "PYTHON",
            "mistakes": 0,
            "time_left": 60,
            "hangman_state": 0,
            "won": True
        })

        updated = User.query.get(user.id)
        assert updated.wins == 1
        assert updated.streak == 1

    def test_save_state_resets_streak_on_loss(self, app, client, db_session):
        """Saving a loss should reset user.streak to 0."""
        from app.models import User
        dw = self._seed_daily_word(db_session)
        user = create_user(db_session, streak=3)
        login(client)

        client.post("/api/daily-state", json={
            "daily_word_id": dw.id,
            "guessed_letters": "ABCDEF",
            "mistakes": 6,
            "time_left": 0,
            "hangman_state": 6,
            "won": False
        })

        updated = User.query.get(user.id)
        assert updated.streak == 0

    def test_save_state_missing_fields(self, app, client, db_session):
        """Missing required fields should return 400."""
        create_user(db_session)
        login(client)

        res = client.post("/api/daily-state", json={"mistakes": 1})
        assert res.status_code == 400

# friends API tests
class TestFriendsAPI:

    def test_add_friend_success(self, app, client, db_session):
        """Adding a valid friend should return 200."""
        user = create_user(db_session, username="user1", email="u1@test.com")
        friend = create_user(db_session, username="user2", email="u2@test.com")
        login(client, email="u1@test.com")

        res = client.post("/api/add-friend", json={"name": "user2"})
        assert res.status_code == 200

    def test_add_friend_not_found(self, app, client, db_session):
        """Adding a non-existent user should return 404."""
        create_user(db_session)
        login(client)

        res = client.post("/api/add-friend", json={"name": "ghostuser"})
        assert res.status_code == 404

    def test_add_yourself_rejected(self, app, client, db_session):
        """Adding yourself as a friend should return 400."""
        create_user(db_session)
        login(client)

        res = client.post("/api/add-friend", json={"name": "testuser"})
        assert res.status_code == 400

    def test_add_duplicate_friend_rejected(self, app, client, db_session):
        """Adding the same friend twice should return 400."""
        create_user(db_session, username="user1", email="u1@test.com")
        create_user(db_session, username="user2", email="u2@test.com")
        login(client, email="u1@test.com")

        client.post("/api/add-friend", json={"name": "user2"})
        res = client.post("/api/add-friend", json={"name": "user2"})
        assert res.status_code == 400

    def test_get_friends_returns_list(self, app, client, db_session):
        """GET /api/friends should return the user's friends list."""
        create_user(db_session, username="user1", email="u1@test.com")
        create_user(db_session, username="user2", email="u2@test.com")
        login(client, email="u1@test.com")

        client.post("/api/add-friend", json={"name": "user2"})
        res = client.get("/api/friends")

        assert res.status_code == 200
        friends = res.get_json()
        assert len(friends) == 1
        assert friends[0]["name"] == "USER2"

    def test_search_users(self, app, client, db_session):
        """User search should return matching users."""
        create_user(db_session, username="alice", email="alice@test.com")
        create_user(db_session, username="bob", email="bob@test.com")
        login(client, email="alice@test.com")

        res = client.get("/api/users/search?q=bob")
        assert res.status_code == 200
        results = res.get_json()
        assert any(u["username"] == "bob" for u in results)

    def test_search_excludes_self(self, app, client, db_session):
        """User search should not return the logged-in user."""
        create_user(db_session, username="alice", email="alice@test.com")
        login(client, email="alice@test.com")

        res = client.get("/api/users/search?q=alice")
        results = res.get_json()
        assert all(u["username"] != "alice" for u in results)
