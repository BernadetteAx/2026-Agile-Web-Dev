from flask import Blueprint, render_template, jsonify, request


# Set of routes to be imported into the Flask app by __init__.py
main = Blueprint("main", __name__)


# Format routes like this to add them to the Flask app
@main.route("/")
def daily_hangman():
    return render_template("daily-hangman.html")