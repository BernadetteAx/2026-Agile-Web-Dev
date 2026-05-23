import hmac
import secrets

from flask import current_app, jsonify, request, session


CSRF_SESSION_KEY = "csrf_token"
CSRF_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


def generate_csrf_token():
    token = session.get(CSRF_SESSION_KEY)
    if not token:
        token = secrets.token_urlsafe(32)
        session[CSRF_SESSION_KEY] = token
    return token


def _submitted_token():
    token = request.headers.get("X-CSRFToken") or request.headers.get("X-CSRF-Token")
    if token:
        return token

    if request.form:
        return request.form.get("csrf_token")

    data = request.get_json(silent=True)
    if isinstance(data, dict):
        return data.get("csrf_token")

    return None


def protect_csrf():
    if not current_app.config.get("WTF_CSRF_ENABLED", True):
        return None

    if request.method not in CSRF_METHODS:
        return None

    expected_token = session.get(CSRF_SESSION_KEY)
    submitted_token = _submitted_token()

    if expected_token and submitted_token and hmac.compare_digest(expected_token, submitted_token):
        return None

    return jsonify({"error": "Invalid or missing CSRF token"}), 400


def init_csrf(app):
    app.jinja_env.globals["csrf_token"] = generate_csrf_token
    app.before_request(protect_csrf)
