const crypto = require("crypto");

class MoveTable {
  constructor(moves) {
    this.moves = moves;
    this.table = this.generateTable();
  }

  generateTable() {
    const size = this.moves.length;
    const table = Array.from({ length: size + 1 }, () =>
      Array(size + 1).fill("")
    );

    for (let i = 0; i < size; i++) {
      table[i + 1][0] = this.moves[i];
      table[0][i + 1] = this.moves[i];
    }

    for (let i = 1; i <= size; i++) {
      for (let j = 1; j <= size; j++) {
        if (i === j) {
          table[i][j] = "Draw";
        } else {
          const result = GameRules.determineWinner(
            this.moves[i - 1],
            this.moves[j - 1]
          );
          table[i][j] = result === 1 ? "Win" : "Lose";
        }
      }
    }

    return table;
  }

  displayTable() {
    console.log("Move Table:");
    console.log(this.table.map((row) => row.join("\t")).join("\n"));
  }
}

class GameRules {
  static determineWinner(move1, move2) {
    const size = MoveTable.moves.length;
    const distance =
      MoveTable.moves.indexOf(move2) - MoveTable.moves.indexOf(move1);
    return (distance + size) % size <= size / 2 ? 1 : -1;
  }
}

class CryptoUtils {
  static generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }

  static calculateHMAC(message, key) {
    const hmac = crypto.createHmac("sha256", key);
    hmac.update(message);
    return hmac.digest("hex");
  }
}

class UserInterface {
  static promptUserForMove() {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      readline.question("Enter your move: ", (move) => {
        readline.close();
        resolve(move);
      });
    });
  }

  static displayMovesMenu(moves) {
    console.log("Available moves:");
    moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
    console.log("0 - exit");
    console.log("? - help");
  }

  static async playGame(moves) {
    this.displayMovesMenu(moves);

    const key = CryptoUtils.generateKey();
    console.log("HMAC key:", key);

    const computerMove = moves[Math.floor(Math.random() * moves.length)];
    const userMove = await this.promptUserForMove();
    let checkUserMove = moves[userMove - 1];
    if (userMove == "?") {
      const table = new MoveTable(moves);
      table.displayTable();
      this.playGame(moves);
    } else if (userMove == 0) {
      console.log("Exiting...");
    } else if (!moves.includes(checkUserMove)) {
      console.log("Invalid move! Choose a valid move.");
      this.playGame(moves);
    } else {
      let userMove1 = moves[userMove - 1];
      const hmac = CryptoUtils.calculateHMAC(userMove1, key);
      console.log("HMAC:", hmac);

      const result = GameRules.determineWinner(userMove1, computerMove);
      console.log(`Your move: ${userMove1}`);
      console.log(`Computer move: ${computerMove}`);

      if (result === 1) {
        console.log("You win!");
      } else if (result === -1) {
        console.log("Computer wins!");
      } else {
        console.log("It's a draw!");
      }

      console.log(`HMAC key: ${key}`);
    }
  }
}

const moves = process.argv.slice(2);
if (
  moves.length < 3 ||
  moves.length % 2 !== 1 ||
  new Set(moves).size !== moves.length
) {
  console.error(
    "Error: Invalid arguments. You need an odd number of non-repeating strings."
  );
  console.error("Example: node game.js rock paper scissors");
} else {
  MoveTable.moves = moves;
  UserInterface.playGame(moves);
}
