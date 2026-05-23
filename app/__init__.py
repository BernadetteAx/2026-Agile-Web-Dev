from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from app.config import Config
from app.security_headers import init_security_headers
from datetime import timedelta

# Establish the database and migration objects. These will be initialized with the Flask app in create_app()
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.permanent_session_lifetime = timedelta(days=30)

    # Load config into the Flask app from the Config class in config.py
    app.config.from_object(Config)

    # Attach the database and migration objects to the Flask app
    db.init_app(app)
    migrate.init_app(app, db)
    init_security_headers(app)

    # Register routes
    from .routes import main
    from app.auth import auth
    app.register_blueprint(main)
    app.register_blueprint(auth)

    # Import models so SQLAlchemy can create tables for them in the database.
    from . import models

    @app.before_request
    def seed_on_first_request():
        if not app.config.get("TESTING"):
            from app.services.seed import seed_achievements
            seed_achievements()
        # Remove itself after first run so it only fires once
        app.before_request_funcs[None].remove(seed_on_first_request)

    return app
