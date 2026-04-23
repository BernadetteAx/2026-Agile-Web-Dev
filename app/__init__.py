from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from app.config import Config

# Establish the database and migration objects. These will be initialized with the Flask app in create_app()
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Load config into the Flask app from the Config class in config.py
    app.config.from_object(Config)

    # Attach the database and migration objects to the Flask app
    db.init_app(app)
    migrate.init_app(app, db)

    # Register routes
    from .routes import main
    app.register_blueprint(main)

    # Import models so SQLAlchemy can create tables for them in the database.
    from . import models

    return app