from flask import Blueprint, render_template, jsonify, request


# Set of routes to be imported into the Flask app by __init__.py
main = Blueprint("main", __name__)


# Format routes like this to add them to the Flask app

#Route for the register page
@main.route("/register")
def register():
    return render_template("register.html")

# Route for the login page
@main.route("/login")
def login():
    return render_template("login.html")

# Route for the confirmation page after registration
@main.route("/confirm")
def confirmation():
    return render_template("confirm.html")

# Routes for the home page 
@main.route("/")
@main.route("/home")
def home():
    return render_template("home.html")

# Route for the daily hangman game page
@main.route("/daily")
def daily_hangman():
    return render_template("daily-page.html")

# Route for the unlimited hangman game page
@main.route("/unlimited")
def unlimited_hangman():
    return render_template("unlimited-page.html")

# Route for the friends page
@main.route("/friends")
def friends():
    return render_template("friend-page.html")

# Route for the achievements page
@main.route("/achievements")
def achievements():
    return render_template("achievements-page.html")