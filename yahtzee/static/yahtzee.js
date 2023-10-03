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
    this.currentRoundIndex = 0; // Current round index
    this.roundScores = Array(roundDescriptions.length).fill(0); // Array to store round scores
    this.gameId = null; // Initialize gameId with null or some default value
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

    // Make a POST request to the server-side to calculate the score
    fetch('/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dice_values: diceValues,
        round_index: this.currentRoundIndex,
        game_id: this.gameId // Added game_id
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(scores => {
        // Update the current round score
        this.roundScores[this.currentRoundIndex] = scores.total;

        // Update the total score
        this.totalScore = this.roundScores.reduce((acc, val) => acc + val, 0);

        // Check if bonus points should be awarded
        if (this.currentRoundIndex === 5 && this.totalScore >= 63) {
          this.roundScores[6] = 35;
          this.totalScore += 35;
        }

        // Update the table with the round scores
        const scoreCells = document.querySelectorAll('.round-score');
        scoreCells.forEach((cell, index) => {
          cell.textContent = this.roundScores[index] || '';
          cell.classList.remove('current-round');
        });

        // Deselect all dice after finishing a round
        const diceImages = document.getElementById('dice-container').querySelectorAll('.animated-dice');
        diceImages.forEach((img) => {
          img.classList.remove('selected');
        });

        // Move to the next round
this.currentRoundIndex++;

// Skip the bonus field if necessary
if (this.currentRoundIndex === 6) {
  this.currentRoundIndex += 1; // Skip the bonus field
}


        if (this.currentRoundIndex >= roundDescriptions.length) {
          this.currentRoundIndex = null; // Set current round index to null if all rounds are completed
          alert('Game Over! Your total score is ' + this.totalScore);
        } else {
          // Mark the current round in green
          scoreCells[this.currentRoundIndex].classList.add('current-round');
        }

        // Update the total score after moving to the next round
        document.getElementById('totalScore').textContent = this.totalScore;
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
  const diceController = new DiceController("GameContainer");
  diceController.run();

  const finishRoundButton = document.getElementById("finishRound");
  finishRoundButton.addEventListener("click", (event) => {
    event.preventDefault();
    if (diceController.rollCount > 0) {
      const diceValues = diceController.getValue();
      localStorage.setItem("diceValues", JSON.stringify(diceValues));

      diceController.calculateScore();

   // Update the table with the round scores
const scoreCells = document.querySelectorAll(".round-score");
scoreCells.forEach((cell, index) => {
  if (index < diceController.currentRoundIndex) {
    cell.textContent = diceController.roundScores[index];
  } else if (index === 6 || index === 7) {
    cell.textContent = ""; // Skip displaying the bonus field and the next round scores
  } else {
    cell.textContent = "";
  }
  cell.classList.remove("current-round");
  if (index === diceController.currentRoundIndex) {
    cell.classList.add("current-round");
  }
});






      // Update the total score
      document.getElementById("totalScore").textContent = diceController.totalScore;

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
    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = description;
    const scoreCell = document.createElement("td");
    scoreCell.classList.add("round-score");
    if (index === 0) {
      scoreCell.classList.add("current-round");
    }
    row.appendChild(descriptionCell);
    row.appendChild(scoreCell);
    roundResultsTable.appendChild(row);
  });
});

// Automatically remove flash messages after 2 seconds

setTimeout(function () {
  var flashMessages = document.querySelector('.flash-messages');
  if (flashMessages) {
    flashMessages.remove();
  }
}, 3000);
