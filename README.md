# Yahtzee Game Web Application

#### This app is hosted and can be tested directly here: [https://mxlars.pythonanywhere.com/]

## Description

This is a Yahtzee web application! In order to play this game, a user must register/login. The user will see a list of all started games and can choose to join an existing one or create a new game. For the 2-4 player versions, the user will be prompted for a playername that will be added to the scoretable.

This Yahtzee version will iterate through 15 rounds, each with different desired dice results in order to score points.
There are a maximum of **3 dice rolls** per round, and you can select/deselect which dice you want to keep for the 2nd and 3rd dice roll so you can strategize your moves.

In **round one**, the goal is to get as many dice "1" as possible. In **round two**, as many dice "2" as possible, and so on.
Check out yahtee rules on wikipedia for more info. My app is following the standard rules, including a bonus (35 points) if a player has scored 63 or more points after first 6 rounds. It was very hard to add the gamelogic for this. I made the game work for all categores first, before i added the bonus.
It took a lot of trying to get the currentRoundIndex to correctly skip the bonus score rows. But in the end, it all worked out!

The table will be marked green on the appropiate location to easier know which round it is, and which category the player is playing for. The total score is the sum of each round, and is always updated.

After the last round, the winner will be notified and with a confirmation of the total score.

## Project Development Details

For this project, I decided to use the following technologies:

- **Python**
- **Flask**
- **SQLite3**
- **Jinja**
- **HTML**
- **CSS**
- **JavaScript**

The `app.py` file contains all the routing needed (GET and POST) to connect the back-end functionality, including database connections with front-end elements and attributes. The login and register HTML files have a GET route that returns their respective HTML page on a specific route. They also have an input form that goes to the POST route, which handles input errors, database connections, and SQL queries on the backend (server side). Passwords are hashed for safety reasons. A newly registered person will also be automatically logged in and redirected to the `/gameview` URL (`gameview.html`), which is the game overview page that lets a user choose how many players that will play.

For simplicity i have created 4 different versions of the game, depending on the amount of players. Since the game logic is different from 1-4 players i figured this was the best choice. Especially since i am not planning on scaling it up or have anything else than local multiplayer.
Because of that i have also chosen to save the values locally instead of in a database.

I have done the scorecalculation on the server-side so that the javascript can get the points handled for each category with ease.


## Javascript
The DiceController object handles the main functionality of the game, including the rolling of dice, displaying dice images, and calculating scores.
It also updates the user interface with the latest round scores and total score, and handles end-of-round and end-of-game scenarios.
The rollDice method triggers an audio effect and sets the dice images to a rolling animation. After a delay, it updates the images to show the final rolled numbers.
The calculateScore method sends a POST request to the /score route on the server-side to calculate the round score based on the rolled dice numbers. It then updates the game state and the user interface accordingly.
Upon loading the webpage, the script initializes a DiceController instance, adds an event listener to the "Finish Round" button, and sets up the score table.
I have 4 html pages with their respective 4 javascript files to easier control the 4 different versions of the game.


## Rules
The rules are explained in detail on the `rules.html` page, which can be accessed through the navigation bar on the layout page. Users do not need to be logged in to view this page.

## Styling
I have used **Bootstrap's CSS** for styling most of my pages. I created a `layout.html` using Jinja so that I didn't need to implement the full HTML files each time. I just extended the `layout.html` and made the necessary changes inside the body. The only page I chose not to use with the layout extension is the page for playing the Yahtzee game. Due to spacing and style preferences, I used my own CSS file instead of Bootstrap for this page.

## Conclusion
This project has been very challenging but also an incredible journey. Thanks to CS50, I have learned so much, especially how to problem-solve better and adapt to new technologies. As I am in my last year of studying for a bachelor's degree in Computer Engineering, Professor David J. Malan and all the staff at Harvard University have helped me fill many knowledge gaps. I now have a higher understanding of many concepts and methods that I'm confident will benefit me going forward. I extend a huge thanks to everyone at Harvard University for providing me with this opportunity.

And once again, I want to express my gratitude to Professor David J. Malan for his amazing lectures, the incredible way he explains things, and the enthusiasm that motivated me throughout these months. Thank you!
