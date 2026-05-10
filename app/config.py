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
