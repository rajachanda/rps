export class GameLogic {
  constructor() {
    this.choices = ['rock', 'paper', 'scissors'];
  }

  determineWinner(playerChoices, players) {
    const playerIds = Object.keys(playerChoices);
    const choice1 = playerChoices[playerIds[0]];
    const choice2 = playerChoices[playerIds[1]];

    if (choice1 === choice2) {
      return {
        winner: null,
        result: 'tie',
        message: "It's a tie!"
      };
    }

    let winnerId = null;
    
    if ((choice1 === 'rock' && choice2 === 'scissors') ||
        (choice1 === 'paper' && choice2 === 'rock') ||
        (choice1 === 'scissors' && choice2 === 'paper')) {
      winnerId = playerIds[0];
    } else {
      winnerId = playerIds[1];
    }

    const winner = players.find(p => p.id === winnerId);
    
    return {
      winner: winnerId,
      result: 'win',
      message: `${winner.name} wins this round!`,
      winnerName: winner.name
    };
  }

  getAIChoice() {
    const randomIndex = Math.floor(Math.random() * this.choices.length);
    return this.choices[randomIndex];
  }

  playAgainstAI(playerChoice) {
    const aiChoice = this.getAIChoice();
    
    if (playerChoice === aiChoice) {
      return {
        aiChoice,
        result: 'tie',
        message: "It's a tie!"
      };
    }

    let playerWins = false;
    
    if ((playerChoice === 'rock' && aiChoice === 'scissors') ||
        (playerChoice === 'paper' && aiChoice === 'rock') ||
        (playerChoice === 'scissors' && aiChoice === 'paper')) {
      playerWins = true;
    }

    return {
      aiChoice,
      result: playerWins ? 'win' : 'lose',
      message: playerWins ? 'You win!' : 'AI wins!'
    };
  }
}