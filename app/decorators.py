from functools import wraps
from flask import session, redirect, url_for, request, jsonify


def login_required(f):
    """
    Use on page routes  → redirects to /login if not authenticated.
    Use on API routes   → returns 401 JSON if not authenticated.
    
    Usage:
        @main.route("/daily")
        @login_required
        def daily_hangman():
            ...

        @main.route("/api/some-endpoint")
        @login_required
        def some_api():
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("user_id"):
            # Return JSON for API routes, redirect for page routes
            if request.path.startswith("/api/"):
                return jsonify({"error": "Authentication required"}), 401
            return redirect(url_for("main.login"))
        return f(*args, **kwargs)
    return decorated