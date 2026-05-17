"""
Run with: python -m pytest app/tests/test_unit.py -v
"""

import pytest
from unittest.mock import patch, MagicMock
from datetime import date

# app fixture
@pytest.fixture
def app():
    from app import create_app, db

    test_app = create_app()
    test_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SECRET_KEY": "test-secret-key",
        "WTF_CSRF_ENABLED": False,
    })

    with test_app.app_context():
        db.create_all()  # create tables first
        # seed achievements after tables exist
        from app.services.seed import seed_achievements
        seed_achievements()
        yield test_app
        db.session.remove()
        db.drop_all()  # clean up after each test


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

    # password should be hashed not stored as plaintext
    def test_password_is_hashed(self, app, db_session):
        user = create_user(db_session)
        assert user.password != "password1"
        assert user.check_password("password1") is True

    # check_password should return True for the correct password
    def test_check_password_correct(self, app, db_session):
        user = create_user(db_session)
        assert user.check_password("password1") is True

    # new users should start with 0 wins and 0 streak
    def test_user_defaults(self, app, db_session):
        user = create_user(db_session)
        assert user.wins == 0
        assert user.streak == 0

    # username should be unique
    def test_username_is_unique(self, app, db_session):
        from app import db
        from sqlalchemy.exc import IntegrityError
        create_user(db_session, username="dupeuser", email="a@a.com")
        with pytest.raises(IntegrityError):
            create_user(db_session, username="dupeuser", email="b@b.com")

    # email should be unique
    def test_email_is_unique(self, app, db_session):
        from app import db
        from sqlalchemy.exc import IntegrityError
        create_user(db_session, username="user1", email="same@same.com")
        with pytest.raises(IntegrityError):
            create_user(db_session, username="user2", email="same@same.com")

# auth route tests
class TestAuthRoutes:

    # valid registration should create a user and return 201
    def test_register_success(self, app, client):
        res = client.post("/api/auth/register", json={
            "username": "newuser",
            "email": "new@test.com",
            "password": "password1"
        })
        assert res.status_code == 201
        assert res.get_json()["username"] == "newuser"

    # registration without all fields should return 400
    def test_register_missing_fields(self, app, client):
        res = client.post("/api/auth/register", json={"email": "x@x.com"})
        assert res.status_code == 400

    # password under 8 characters should be rejected
    def test_register_short_password(self, app, client):
        res = client.post("/api/auth/register", json={
            "username": "shortpw",
            "email": "short@test.com",
            "password": "abc1"
        })
        assert res.status_code == 400

    # registering with an existing email should return 400
    def test_register_duplicate_email(self, app, client, db_session):
        create_user(db_session)
        res = client.post("/api/auth/register", json={
            "username": "another",
            "email": "test@test.com",
            "password": "password1"
        })
        assert res.status_code == 400

    # registering with an existing username should return 400
    def test_register_duplicate_username(self, app, client, db_session):
        create_user(db_session)
        res = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "different@test.com",
            "password": "password1"
        })
        assert res.status_code == 400

    # valid login should return 200 and user info
    def test_login_success(self, app, client, db_session):
        create_user(db_session)
        res = login(client)
        assert res.status_code == 200
        assert "username" in res.get_json()

    # wrong password should return 401
    def test_login_wrong_password(self, app, client, db_session):
        create_user(db_session)
        res = client.post("/api/auth/login", json={
            "email": "test@test.com",
            "password": "wrongpassword"
        })
        assert res.status_code == 401

    # logging in with an unknown email should return 401
    def test_login_nonexistent_user(self, app, client):
        res = client.post("/api/auth/login", json={
            "email": "nobody@test.com",
            "password": "password1"
        })
        assert res.status_code == 401

    # logout should return 200 and clear the session
    def test_logout(self, app, client, db_session):
        create_user(db_session)
        login(client)
        res = client.post("/api/auth/logout")
        assert res.status_code == 200

    # unauthenticated /api/auth/me should return 401
    def test_me_unauthenticated(self, app, client):
        res = client.get("/api/auth/me")
        assert res.status_code == 401

    # registration with invalid email format should return 400
    def test_register_invalid_email(self, app, client):
        res = client.post("/api/auth/register", json={
            "username": "bademail",
            "email": "notanemail",
            "password": "password1"
        })
        assert res.status_code == 400

    # registration password without a number should return 400
    def test_register_password_requires_number(self, app, client):
        res = client.post("/api/auth/register", json={
            "username": "nonumber",
            "email": "nonumber@test.com",
            "password": "password"
        })
        assert res.status_code == 400


    # registration password without a letter should return 400
    def test_register_password_requires_letter(self, app, client):
        res = client.post("/api/auth/register", json={
            "username": "noletter",
            "email": "noletter@test.com",
            "password": "12345678"
        })
        assert res.status_code == 400


# protected route tests
class TestProtectedRoutes:

    # accessing protected routes without login should redirect to login page
    def test_home_redirects_when_not_logged_in(self, app, client):
        res = client.get("/home")
        assert res.status_code == 302
        assert "/login" in res.headers["Location"]

    # home page should be accessible when logged in
    def test_home_accessible_when_logged_in(self, app, client, db_session):
        create_user(db_session)
        login(client)
        res = client.get("/home")
        assert res.status_code == 200

    # daily page should be accessible when logged in
    def test_api_achievements_requires_login(self, app, client):
        res = client.get("/api/achievements")
        assert res.status_code == 401

# achievement logic tests
class TestAchievementLogic:

    # win games achievement should unlock when user has enough wins
    def test_win_games_achievement_unlocked(self, app, db_session):
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

    # win games achievement should not unlock when user has too few wins
    def test_win_games_achievement_locked(self, app, db_session):
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

    # streak achievement should unlock when user has enough streak
    def test_streak_achievement_unlocked(self, app, db_session):
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

    # streak achievement should not unlock when user has too low streak
    def test_streak_achievement_locked(self, app, db_session):
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

    # achievements with unknown condition types should return False
    def test_unknown_condition_returns_false(self, app, db_session):
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

    # accessing daily word without login should return 401
    def test_daily_word_requires_login(self, app, client):
        res = client.get("/api/daily-word")
        assert res.status_code == 401

    # daily word endpoint should return a word when logged in
    @patch("app.routes.requests.get")
    def test_daily_word_returns_word(self, mock_get, app, client, db_session):
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {
                "word": "python",
                "meanings": [
                    {
                        "partOfSpeech": "noun",
                        "definitions": [
                            {"definition": "A programming language."}
                        ]
                    }
                ]
            }
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

    # the same word should be returned on repeated calls for the same day
    @patch("app.routes.get_word_definition")
    @patch("app.routes.get_word_from_list")
    def test_same_word_returned_for_today(self, mock_get_word, mock_definition, app, client, db_session):
        from app.models import DailyWord
        from app import db

        mock_definition.return_value = {
            "definition": "A programming language.",
            "part_of_speech": "noun",
        }

        # Pre-seed today's word
        today_word = DailyWord(word="PYTHON", date=date.today())
        db.session.add(today_word)
        db.session.commit()

        create_user(db_session)
        login(client)

        res1 = client.get("/api/daily-word")
        res2 = client.get("/api/daily-word")

        assert res1.get_json()["word"] == res2.get_json()["word"]
        # A new word should NOT be chosen since today's word already exists
        mock_get_word.assert_not_called()

    @patch("app.routes.get_word_definition")
    @patch("app.routes.get_word_from_list")
    def test_daily_word_skips_words_without_dictionary_entry(self, mock_get_word, mock_definition, app, client, db_session):
        mock_get_word.side_effect = ["NOTAWORD", "PYTHON"]
        mock_definition.side_effect = [
            {"definition": "", "part_of_speech": ""},
            {"definition": "A programming language.", "part_of_speech": "noun"},
            {"definition": "A programming language.", "part_of_speech": "noun"},
        ]

        create_user(db_session)
        login(client)

        res = client.get("/api/daily-word")

        assert res.status_code == 200
        assert res.get_json()["word"] == "PYTHON"

# daily game state tests
class TestDailyGameState:

    # helper to seed a daily word for testing
    def _seed_daily_word(self, db_session):
        from app.models import DailyWord
        from app import db
        dw = DailyWord(word="PYTHON", date=date.today())
        db.session.add(dw)
        db.session.commit()
        return dw

    # saving game state without login should return 401
    def test_save_state_requires_login(self, app, client):
        res = client.post("/api/daily-state", json={})
        assert res.status_code == 401

    # saving a valid game state should return 201
    def test_save_state_success(self, app, client, db_session):
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

    # saving a win should increment user wins and streak
    def test_save_state_updates_wins_on_win(self, app, client, db_session):
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

    # saving a loss should reset user streak to 0
    def test_save_state_resets_streak_on_loss(self, app, client, db_session):
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

    # missing required fields should return 400
    def test_save_state_missing_fields(self, app, client, db_session):
        create_user(db_session)
        login(client)

        res = client.post("/api/daily-state", json={"mistakes": 1})
        assert res.status_code == 400

# friends API tests
class TestFriendsAPI:

    # adding a valid friend should return 200
    def test_add_friend_success(self, app, client, db_session):
        user = create_user(db_session, username="user1", email="u1@test.com")
        friend = create_user(db_session, username="user2", email="u2@test.com")
        login(client, email="u1@test.com")

        res = client.post("/api/add-friend", json={"name": "user2"})
        assert res.status_code == 200

    # adding a non-existent user should return 404
    def test_add_friend_not_found(self, app, client, db_session):
        create_user(db_session)
        login(client)

        res = client.post("/api/add-friend", json={"name": "ghostuser"})
        assert res.status_code == 404

    # adding yourself as a friend should return 400
    def test_add_yourself_rejected(self, app, client, db_session):
        create_user(db_session)
        login(client)

        res = client.post("/api/add-friend", json={"name": "testuser"})
        assert res.status_code == 400

    # adding the same friend twice should return 400
    def test_add_duplicate_friend_rejected(self, app, client, db_session):
        create_user(db_session, username="user1", email="u1@test.com")
        create_user(db_session, username="user2", email="u2@test.com")
        login(client, email="u1@test.com")

        client.post("/api/add-friend", json={"name": "user2"})
        res = client.post("/api/add-friend", json={"name": "user2"})
        assert res.status_code == 400

    # getting friends list should return the user's friends
    def test_get_friends_returns_list(self, app, client, db_session):
        create_user(db_session, username="user1", email="u1@test.com")
        create_user(db_session, username="user2", email="u2@test.com")
        login(client, email="u1@test.com")

        client.post("/api/add-friend", json={"name": "user2"})
        res = client.get("/api/friends")

        assert res.status_code == 200
        friends = res.get_json()
        assert len(friends) == 1
        assert friends[0]["name"] == "USER2"

    # searching for users should return matching users
    def test_search_users(self, app, client, db_session):
        create_user(db_session, username="alice", email="alice@test.com")
        create_user(db_session, username="bob", email="bob@test.com")
        login(client, email="alice@test.com")

        res = client.get("/api/users/search?q=bob")
        assert res.status_code == 200
        results = res.get_json()
        assert any(u["username"] == "bob" for u in results)

    # searching for users should be case-insensitive
    def test_search_excludes_self(self, app, client, db_session):
        create_user(db_session, username="alice", email="alice@test.com")
        login(client, email="alice@test.com")

        res = client.get("/api/users/search?q=alice")
        results = res.get_json()
        assert all(u["username"] != "alice" for u in results)