import os

# Find the path to this file
basedir = os.path.abspath(os.path.dirname(__file__))

# Build a path to app.db and set as default database location
default_database_location = 'sqlite:///' + os.path.join(basedir, 'app.db')

# Tell Flask to use DATABASE_URL if provided, otherwise use app.db
class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or default_database_location
    # Set a secret key for the app. This is used to protect against CSRF attacks and to sign cookies.
    SECRET_KEY = os.getenv("HANGMAN_SECRET_KEY")
    # Ensure that the SECRET_KEY environment variable is set. If not, raise an error to prevent the app from running without a secret key.
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY environment variable is not set")
    
""" class DeploymentConfig(Config):
    # In production, disable debug mode for security reasons
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or default_database_location


class TestingConfig(Config):
    # Use an in-memory SQLite database for testing to ensure tests run quickly and do not affect the production database
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    # Enable testing mode, which provides better error messages and disables error catching during request handling
    TESTING = True """

