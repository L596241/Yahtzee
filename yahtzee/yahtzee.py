import json
import random
import sqlite3
from collections import Counter

from flask import (Flask, flash, jsonify, redirect, render_template, request,
                   session, url_for)
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.config.from_pyfile('config.cfg')



# Connect to the SQLite database
conn = sqlite3.connect('yahtzee.db')
cursor = conn.cursor()

# Create users table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password_hash TEXT NOT NULL
    );
''')

conn.commit()
conn.close()

@app.route('/')
def index():
    """Show landing page"""
    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""
    if request.method == "POST":
        if not request.form.get("username"):
            flash("You must provide a username")
            return render_template("login.html")
        elif not request.form.get("password"):
            flash("You must provide a password")
            return render_template("login.html")

        conn = sqlite3.connect('yahtzee.db')
        cursor = conn.cursor()

        username = request.form.get("username")
        password = request.form.get("password")

        cursor.execute("SELECT * FROM users WHERE username=?", (username,))
        user = cursor.fetchone()

        if user is None or not check_password_hash(user[2], password):
            flash("Invalid username and/or password")
            conn.close()
            return render_template("login.html")

        session["user_id"] = user[0]
        conn.close()
        return redirect(url_for("gameview"))
    else:
        return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    if request.method == "POST":
        if not request.form.get("username"):
            flash(f"You must provide a username")
            return render_template("register.html")
        elif not request.form.get("password"):
            flash(f"You must provide a password")
            return render_template("register.html")
        elif not request.form.get("confirmation"):
            flash(f"You must confirm password")
            return render_template("register.html")
        elif request.form.get("password") != request.form.get("confirmation"):
            flash(f"Passwords do not match")
            return render_template("register.html")

        conn = sqlite3.connect('yahtzee.db')
        cursor = conn.cursor()

        username = request.form.get("username")
        password = request.form.get("password")

        cursor.execute("SELECT * FROM users WHERE username=?", (username,))
        existing_user = cursor.fetchone()

        if existing_user:
            flash(f"Username already exists")
            conn.close()
            return render_template("register.html")

        password_hash = generate_password_hash(password)
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, password_hash))
        user_id = cursor.lastrowid

        conn.commit()
        conn.close()

        session["user_id"] = user_id

        return redirect(url_for("gameview"))
    else:
        return render_template("register.html")



@app.route("/gameview", methods=["GET", "POST"])
def gameview():
    """Select yahtzee game versions"""
    if request.method == "POST":
        if not session.get("user_id"):
            flash("You must be logged in to view the game!")
            return redirect(url_for('login'))

        players = request.form.get("players")
        return redirect(url_for(f"playgame{players}"))
    else:
        return render_template("gameview.html")

# Neccesary routes for the different yahtzee game versions
@app.route("/playgame1")
def playgame1():
    flash("Roll the dices to start the game. Click on the dices you want to keep")
    return render_template("playgame.html")

@app.route("/playgame2")
def playgame2():
    flash("Roll the dices to start the game. Click on the dices you want to keep")
    return render_template("playgame2.html")

@app.route("/playgame3")
def playgame3():
    flash("Roll the dices to start the game. Click on the dices you want to keep")
    return render_template("playgame3.html")

@app.route("/playgame4")
def playgame4():
    flash("Roll the dices to start the game. Click on the dices you want to keep")
    return render_template("playgame4.html")


@app.route("/rules")
def rules():
    """Show the rules of the game"""
    return render_template("rules.html")

@app.route("/about")
def about():
    """Show the about page"""
    return render_template("about.html")


# score calculation
@app.route('/score', methods=['POST'])
def calculate_score():
    # Parse data from the request
    request_data = request.json
    dice_values = request_data.get('dice_values', [])
    game_id = request_data.get('game_id')
    round_index = request_data.get('round_index', 0)

    # Validation check
    if not game_id:
        return jsonify({'error': 'No game_id provided'}), 400

    # Calculate the round score
    round_scores = calculate_round_scores(dice_values, round_index)

    # Add up all the scores to get the total score
    total_score = sum(round_scores.values())
    round_scores['total'] = total_score


    return jsonify(round_scores)




# -------------------------------------------------------------------------------------------------------- #
# calculation logic #

def calculate_round_scores(dice_values, round_index):
    """Calculate the score for the current round based on the dice values."""
    round_scores = {}  # Initialize a dictionary to store round scores.

    # Count the occurrence of each dice value.
    dice_counts = {i: dice_values.count(i) for i in range(1, 7)}

    # Define the scoring categories.
    categories = [('Ones', 0), ('Twos', 1), ('Threes', 2), ('Fours', 3),
                  ('Fives', 4), ('Sixes', 5), ('bonus', 6), ('One Pair', 7), ('Two Pairs', 8),
                  ('ThreeOfAKind', 9), ('FourOfAKind', 10), ('SmallStraight', 11),
                  ('LargeStraight', 12), ('FullHouse', 13), ('Chance', 14), ('Yahtzee', 14)]

    # Get the current category and its index.
    category, category_index = categories[round_index]

    # Calculate score based on the current category.
    if category in ['Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes']:
        # For these categories, the score is the dice value times its count.
        round_scores[category] = (category_index + 1) * dice_counts.get(category_index + 1, 0)
    elif category == 'One Pair':
        # Find pairs and score is double the maximum pair value.
        pairs = [value for value, count in dice_counts.items() if count >= 2]
        round_scores[category] = max(pairs) * 2 if pairs else 0
    elif category == 'Two Pairs':
        # Find pairs and if there are two or more pairs, the score is sum of pairs * 2.
        pair_values = [value for value, count in dice_counts.items() if count >= 2]
        if len(pair_values) >= 2:
            round_scores[category] = sum(pair_values) * 2
        elif len(pair_values) == 1:
            # Handle the case of four equal dice
            if dice_values.count(pair_values[0]) == 4:
                round_scores[category] = pair_values[0] * 4
            else:
                round_scores[category] = 0
        else:
            round_scores[category] = 0
    elif category == 'ThreeOfAKind':
        # Find the dice value that appears three times and score is that value * 3.
        three_of_a_kind_values = [value for value, count in dice_counts.items() if count >= 3]
        round_scores[category] = max(three_of_a_kind_values) * 3 if three_of_a_kind_values else 0
    elif category == 'FourOfAKind':
        # Find the dice value that appears four times and score is that value * 4.
        four_of_a_kind_values = [value for value, count in dice_counts.items() if count >= 4]
        round_scores[category] = max(four_of_a_kind_values) * 4 if four_of_a_kind_values else 0
    elif category == 'FullHouse':
        # Full house is when there is a pair and a three of a kind.
        counts = list(dice_counts.values())
        round_scores[category] = 25 if 2 in counts and 3 in counts else 0
    elif category == 'SmallStraight':
        # Small straight is four consecutive dice.
        round_scores[category] = 30 if is_consecutive(dice_values, 4) else 0
    elif category == 'LargeStraight':
        # Large straight is five consecutive dice.
        round_scores[category] = 40 if is_consecutive(dice_values, 5) else 0
    elif category == 'Chance':
        # Chance is the sum of all dice.
        round_scores[category] = sum(dice_values)
    elif category == 'Yahtzee':
        # Yahtzee is when all dice are the same.
        round_scores[category] = 50 if len(set(dice_values)) == 1 else 0

    # Return the round scores.
    return round_scores




def is_consecutive(dice_values, length):
    """Check if there are 'length' number of consecutive dice values."""
    dice_values = sorted(list(set(dice_values)))  # Sort and remove duplicates
    for i in range(len(dice_values) - length + 1):
        if dice_values[i:i + length] == list(range(dice_values[i], dice_values[i] + length)):
            return True
    return False




if __name__ == "__main__":
    app.run(debug=True)
