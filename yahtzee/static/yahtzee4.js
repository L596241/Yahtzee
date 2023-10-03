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
        this.totalScorePlayer3 = 0;
        this.totalScorePlayer4 = 0;  // Add this line
        this.currentPlayer = 1;
        this.currentRoundIndex = 0; // Current round index
        this.roundScores = Array(roundDescriptions.length).fill(0); // Array to store round scores
        this.roundScoresPlayer2 = Array(roundDescriptions.length).fill(0); // Array to store round scores for player 2
        this.roundScoresPlayer3 = Array(roundDescriptions.length).fill(0); // Array to store round scores for player 3
        this.roundScoresPlayer4 = Array(roundDescriptions.length).fill(0); // Array to store round scores for player 4
        this.gameId = null; // Initialize gameId with null or some default value
        this.player1Name = "";
        this.player2Name = "";
        this.player3Name = "";
        this.player4Name = "";
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
            }
          } else if (this.currentPlayer === 3) {
            this.roundScoresPlayer3[this.currentRoundIndex] = scores.total;
            this.totalScorePlayer3 = this.roundScoresPlayer3.reduce((acc, val) => acc + val, 0);

            // Check if bonus points should be awarded for player 3
            if (this.currentRoundIndex === 5 && this.totalScorePlayer3 >= 63) {
              this.roundScoresPlayer3[6] = 35;
              this.totalScorePlayer3 += 35;
            }
          } else if (this.currentPlayer === 4) {
            this.roundScoresPlayer4[this.currentRoundIndex] = scores.total;
            this.totalScorePlayer4 = this.roundScoresPlayer4.reduce((acc, val) => acc + val, 0);

            // Check if bonus points should be awarded for player 4
            if (this.currentRoundIndex === 5 && this.totalScorePlayer4 >=63) {
              this.roundScoresPlayer4[6] = 35;
              this.totalScorePlayer4 += 35;
              this.currentRoundIndex += 1;
            }
            else if (this.currentRoundIndex === 5 && this.totalScorePlayer4) {
              this.currentRoundIndex += 1;
          }
        }
          // Switch to the next player or move to the next round
          if (this.currentPlayer === 1) {
            this.currentPlayer = 2;
          } else if (this.currentPlayer === 2) {
            this.currentPlayer = 3;
          } else if (this.currentPlayer === 3) {
            this.currentPlayer = 4;
          } else if (this.currentPlayer === 4) {
            this.currentPlayer = 1;
            this.currentRoundIndex++;
          }
        }

        // Check for game over after all rounds are completed
        if (this.currentRoundIndex >= roundDescriptions.length) {
          const scores = [this.totalScore, this.totalScorePlayer2, this.totalScorePlayer3, this.totalScorePlayer4];
          const maxScore = Math.max(...scores);
          const winners = [];
          for (let i = 0; i < scores.length; i++) {
            if (scores[i] === maxScore) {
              winners.push(i + 1);
            }
          }
          const winnerName = winners.map((winnerIndex) => {
            if (winnerIndex === 1) {
              return this.player1Name;
            } else if (winnerIndex === 2) {
              return this.player2Name;
            } else if (winnerIndex === 3) {
              return this.player3Name;
            } else if (winnerIndex === 4) {
              return this.player4Name;
            }
          });
          const winnerMessage = `Game Over! ${winnerName} is the winner with ${maxScore} points!`;
          alert(winnerMessage);
          this.currentRoundIndex = null;
        }
        // Update the table with the round scores for all players
        const scoreRows = document.querySelectorAll(".round-score-row");
        scoreRows.forEach((row, index) => {
          row.childNodes[1].textContent = this.roundScores[index] || "";
          row.childNodes[2].textContent = this.roundScoresPlayer2[index] || "";
          row.childNodes[3].textContent = this.roundScoresPlayer3[index] || "";
          row.childNodes[4].textContent = this.roundScoresPlayer4[index] || "";
          row.childNodes[1].classList.remove("current-round");
          row.childNodes[2].classList.remove("current-round");
          row.childNodes[3].classList.remove("current-round");
          row.childNodes[4].classList.remove("current-round");
          if (index === this.currentRoundIndex) {
            if (this.currentPlayer === 1) {
              row.childNodes[1].classList.add("current-round");
            } else if (this.currentPlayer === 2) {
              row.childNodes[2].classList.add("current-round");
            } else if (this.currentPlayer === 3) {
              row.childNodes[3].classList.add("current-round");
            } else if (this.currentPlayer === 4) {
              row.childNodes[4].classList.add("current-round");
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
          this.currentRoundIndex += 2;
        }

        // Update the total score after moving to the next round
        document.getElementById("totalScorePlayer1").textContent = this.totalScore;
        document.getElementById("totalScorePlayer2").textContent = this.totalScorePlayer2;
        document.getElementById("totalScorePlayer3").textContent = this.totalScorePlayer3;
        document.getElementById("totalScorePlayer4").textContent = this.totalScorePlayer4;
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
  const player3Name = prompt("Please enter Player 3's name", "") || "Player 3";
  const player4Name = prompt("Please enter Player 4's name", "") || "Player 4";

  document.getElementById("player1Label").textContent = `${player1Name}'s Score:`;
  document.getElementById("player2Label").textContent = `${player2Name}'s Score:`;
  document.getElementById("player3Label").textContent = `${player3Name}'s Score:`;
  document.getElementById("player4Label").textContent = `${player4Name}'s Score:`;


  const diceController = new DiceController("GameContainer");
  diceController.player1Name = player1Name;
  diceController.player2Name = player2Name;
  diceController.player3Name = player3Name;
  diceController.player4Name = player4Name;
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
      const scoreCellPlayer3 = document.createElement("td");
      scoreCellPlayer3.classList.add("round-score");
      const scoreCellPlayer4 = document.createElement("td");
      scoreCellPlayer4.classList.add("round-score");


      row.appendChild(descriptionCell);
      row.appendChild(scoreCellPlayer1);
      row.appendChild(scoreCellPlayer2);
      row.appendChild(scoreCellPlayer3);
      row.appendChild(scoreCellPlayer4);
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
