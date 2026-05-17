from flask import Blueprint, request, jsonify, session
from app import db
from app.models import User

auth = Blueprint("auth", __name__)


@auth.route("/api/auth/register", methods=["POST"])
def register():
    """
    Expects JSON: { "email": "...", "username": "...", "password": "..." }
    Returns 201 on success, 400 on validation errors.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    email    = (data.get("email") or "").strip().lower()
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    # Basic validation
    if not email or not username or not password:
        return jsonify({"error": "email, username and password are all required"}), 400
    
    if "@" not in email or "." not in email:
        return jsonify({"error": "Please enter a valid email address"}), 400

    if len(username) > 10:
        return jsonify({"error": "Username must be 10 characters or less"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    
    if not any(char.isalpha() for char in password) or not any(char.isdigit() for char in password):
        return jsonify({"error": "Password must contain at least one letter and one number"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with that email already exists"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "That username is already taken"}), 400

    user = User(email=email, username=username)
    user.set_password(password)           # hashes via werkzeug

    db.session.add(user)
    db.session.commit()

    # Log the user in immediately after registration
    session["user_id"] = user.id
    session.permanent = True

    return jsonify({"message": "Account created", "username": user.username}), 201


@auth.route("/api/auth/login", methods=["POST"])
def login():
    """
    Expects JSON: { "email": "...", "password": "..." }
    Returns 200 on success, 401 on bad credentials.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    email    = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    # Use a constant-time check (check_password handles this via werkzeug)
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["user_id"] = user.id
    session.permanent = True

    return jsonify({"message": "Logged in", "username": user.username}), 200


@auth.route("/api/auth/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"}), 200


@auth.route("/api/auth/me")
def me():
    """
    Returns the currently logged-in user's public info, or 401 if not logged in.
    Useful for the frontend to check session status on page load.
    """
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    user = User.query.get(user_id)
    if not user:
        session.pop("user_id", None)
        return jsonify({"error": "User not found"}), 401

    return jsonify({
        "id": user.id,
        "username": user.username,
        "wins": user.wins,
        "streak": user.streak,
    }), 200