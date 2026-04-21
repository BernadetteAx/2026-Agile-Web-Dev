from flask import Blueprint, render_template, jsonify, request
# Set of routes to be imported into the main app by __init__.py
main = Blueprint("main", __name__)


@main.route("/")
def daily_hangman():
    return render_template("daily-hangman.html")