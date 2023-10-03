// Represents a Dice object that has a random value
class Dice {
  constructor() {
    this.value = 1;
  }

  // Rolls the dice and sets a new random value between 1 and 6
  roll() {
    this.value = Math.floor(Math.random() * 6 + 1);
  }
}

// Represents a Dice Controller object that manages the rolling of five dice
class DiceController {
  constructor(root) {
    this.root = root;
    this.dices = Array(5).fill(null).map(() => new Dice());
    this.rollCount = 0;
    this.totalScore = 0;
    this.totalScorePlayer2 = 0;
    this.currentPlayer = 1;
    this.currentRoundIndex = 0; // Current round index
    this.roundScores = Array(roundDescriptions.length).fill(0); // Array to store round scores
    this.roundScoresPlayer2 = Array(roundDescriptions.length).fill(0); // Array to store round scores for player 2
    this.gameId = null; // Initialize gameId with null or some default value
    this.player1Name = "";
    this.player2Name = "";
  }


  run() {
    const rollButton = document.getElementById(this.root).querySelector("#roll-dice-btn");
    rollButton.addEventListener("click", () => {
      if (this.rollCount < 3 && this.currentRoundIndex !== null) {
        this.rollDice();
        this.rollCount++;
        if (this.rollCount === 3) {
          rollButton.disabled = true;
        }
      } else if (this.currentRoundIndex === null) {
        alert("Game is over! Please refresh the page to play again!");
      }
    }, true);

    for (let i = 0; i < 5; i++) {
      let img = document.createElement("img");
      img.classList.add("animated-dice");
      img.src = this.imgLink(1);
      document.getElementById("dice-container").appendChild(img);
      img.addEventListener("click", () => {
        if (this.rollCount !== 0) {
          img.classList.toggle("selected");
        }
      });
    }
  }

  rollDice() {
    // Don't roll if game is over
    if (this.currentRoundIndex === null) {
      return;
    }

    this.gameId++;
    const audio = new Audio("/static/sound/rolling-dice.mp3");
    audio.play();

    const diceImages = document.getElementById("dice-container").querySelectorAll(".animated-dice");
    diceImages.forEach((img) => {
      if (!img.classList.contains("selected")) {
        img.src = "/static/images/roll.gif";
      }
    });

    setTimeout(() => {
      diceImages.forEach((img, index) => {
        if (!img.classList.contains("selected")) {
          this.dices[index].roll();
          img.src = this.imgLink(this.dices[index].value);
        }
      });
    }, 1000);
  }

  calculateScore() {
    const diceValues = this.dices.map((dice) => dice.value);

    fetch('/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dice_values: diceValues,
        round_index: this.currentRoundIndex,
        game_id: this.gameId
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(scores => {
        if (scores.total !== null) {
          if (this.currentPlayer === 1) {
            this.roundScores[this.currentRoundIndex] = scores.total;
            this.totalScore = this.roundScores.reduce((acc, val) => acc + val, 0);

            // Check if bonus points should be awarded for player 1
            if (this.currentRoundIndex === 5 && this.totalScore >= 63) {
              this.roundScores[6] = 35;
              this.totalScore += 35;
            }
          } else if (this.currentPlayer === 2) {
            this.roundScoresPlayer2[this.currentRoundIndex] = scores.total;
            this.totalScorePlayer2 = this.roundScoresPlayer2.reduce((acc, val) => acc + val, 0);

            // Check if bonus points should be awarded for player 2
            if (this.currentRoundIndex === 5 && this.totalScorePlayer2 >= 63) {
              this.roundScoresPlayer2[6] = 35;
              this.totalScorePlayer2 += 35;
              this.currentRoundIndex += 1;
            }
            else if (this.currentRoundIndex === 5 && this.totalScorePlayer2) {
              this.currentRoundIndex += 1;
            
            }
          }

          // Switch to the next player or move to the next round
          if (this.currentPlayer === 1) {
            this.currentPlayer = 2;
          } else {
            this.currentPlayer = 1;
            this.currentRoundIndex++;
          }
        }

        // Check for winner after all rounds are completed
        if (this.currentRoundIndex >= roundDescriptions.length) {
          if (this.totalScore > this.totalScorePlayer2) {
            alert(`Game Over! ${this.player1Name} is the winner with ${this.totalScore} points!`);
          } else if (this.totalScore < this.totalScorePlayer2) {
            alert(`Game Over! ${this.player2Name} is the winner with ${this.totalScorePlayer2} points!`);
          } else {
            alert("Game Over! It's a tie!");
          }
        }

        // Update the table with the round scores for both players
        const scoreRows = document.querySelectorAll(".round-score-row");
        scoreRows.forEach((row, index) => {
          row.childNodes[1].textContent = this.roundScores[index] || "";
          row.childNodes[2].textContent = this.roundScoresPlayer2[index] || "";
          row.childNodes[1].classList.remove("current-round");
          row.childNodes[2].classList.remove("current-round");
          if (index === this.currentRoundIndex) {
            if (this.currentPlayer === 1) {
              row.childNodes[1].classList.add("current-round");
            } else {
              row.childNodes[2].classList.add("current-round");
            }
          }
        });

        // Reset the roll count, enable the roll button, and deselect the dice
        this.rollCount = 0;
        const rollButton = document.getElementById("roll-dice-btn");
        rollButton.disabled = false;
        const diceImages = document.getElementById("dice-container").querySelectorAll(".animated-dice");
        diceImages.forEach((img) => {
          img.classList.remove("selected");
        });

        // Skip the bonus field if necessary
        if (this.currentRoundIndex === 6) {
          this.currentRoundIndex += 2; // Skip the bonus field
        }

        // Update the total score after moving to the next round
        document.getElementById("totalScorePlayer1").textContent = this.totalScore;
        document.getElementById("totalScorePlayer2").textContent = this.totalScorePlayer2;
      })
      .catch(e => {
        console.error('The server responded with an error: ' + e);
      });
  }





  getValue() {
    return this.dices.map((dice) => dice.value);
  }

  imgLink(diceNumber) {
    return `/static/images/dice_${diceNumber}.png`;
  }
}

// Define round descriptions
const roundDescriptions = [
  "Ones",
  "Twos",
  "Threes",
  "Fours",
  "Fives",
  "Sixes",
  "Bonus",
  "One Pair",
  "Two Pairs",
  "Three of a Kind",
  "Four of a Kind",
  "Small Straight",
  "Large Straight",
  "Full House",
  "Chance",
  "Yahtzee"
];

// Run the dice controller and add event listeners to the buttons
document.addEventListener("DOMContentLoaded", () => {
   // Ask the players for their names
  const player1Name = prompt("Please enter Player 1's name", "") || "Player 1";
  const player2Name = prompt("Please enter Player 2's name", "") || "Player 2";

  // Update the player score labels
  document.getElementById("player1Label").textContent = `${player1Name}'s Score:`;
  document.getElementById("player2Label").textContent = `${player2Name}'s Score:`;

  const diceController = new DiceController("GameContainer");
  diceController.player1Name = player1Name;
  diceController.player2Name = player2Name;
  diceController.run();

  const finishRoundButton = document.getElementById("finishRound");
finishRoundButton.addEventListener("click", (event) => {
  event.preventDefault();
  if (diceController.rollCount > 0) {
    const diceValues = diceController.getValue();
    localStorage.setItem("diceValues", JSON.stringify(diceValues));

    diceController.calculateScore();


    // Reset the roll count and enable the roll button
    diceController.rollCount = 0;
    const rollButton = document.getElementById("roll-dice-btn");
    rollButton.disabled = false;


  } else {
    alert("Please roll the dice first!");
  }
});



  // Initialize the table with the round descriptions and mark the current round
  const roundResultsTable = document.getElementById("roundResults");
  roundDescriptions.forEach((description, index) => {
    const row = document.createElement("tr");
    row.classList.add("round-score-row");
    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = description;
    const scoreCellPlayer1 = document.createElement("td");
    scoreCellPlayer1.classList.add("round-score");
    if (index === 0) {
      scoreCellPlayer1.classList.add("current-round");
    }
    const scoreCellPlayer2 = document.createElement("td");
    scoreCellPlayer2.classList.add("round-score");
    row.appendChild(descriptionCell);
    row.appendChild(scoreCellPlayer1);
    row.appendChild(scoreCellPlayer2);
    roundResultsTable.appendChild(row);
  });
});

  // Automatically remove flash messages after 3 seconds
window.onload = function() {
  setTimeout(function () {
    var flashMessages = document.querySelector('.flash-messages');
    if (flashMessages) {
      flashMessages.remove();
    }
  }, 3000);
  }
