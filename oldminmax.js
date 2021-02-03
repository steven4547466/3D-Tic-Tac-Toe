// This file is just an old file that used to be in sketch.js.
// I moved it here so we wouldn't lose the code.
class MinMax {
  
  static checkDiagonalThroughCube() {
    let player = currentPlayer % 2 == 0 ? "X" : "O"
    let opponent = player == "O" ? "X" : "O"
    let center = cube.getPoint(0, 0, 0);
    let counter = 0;
    for (let i = -1; i < 2; i += 2) {
      for (let j = -1; j < 2; j += 2) {
        let point1 = cube.getPoint(i, 1, j);
        let point2 = cube.getPoint(-i, -1, -j);

        if ([point1.state, point2.state, center.state].filter(p => p == "_").length >= 2)
          continue;


        if (point1.state == center.state ||
          point2.state == center.state ||
          point1.state == point2.state) {
          return point1.state == "_" ? point1 : point2.state == "_" ? point2 : center;
        }

        counter++;
      }
    }
    return null;
  }
  
  static evaluate(b, player, opponent) {
    // Checking for Rows for X or O victory. 
    for (let row = 0; row < 3; row++) {
      if (b[row][0].state == b[row][1].state &&
        b[row][1].state == b[row][2].state) {
        if (b[row][0].state == player)
          return 10;
        else if (b[row][0].state == opponent)
          return -10;
      }
    }

    // Checking for Columns for X or O victory. 
    for (let col = 0; col < 3; col++) {
      if (b[0][col].state == b[1][col].state &&
        b[1][col].state == b[2][col].state) {
        if (b[0][col].state == player)
          return 10;

        else if (b[0][col].state == opponent)
          return -10;
      }
    }

    // Checking for Diagonals for X or O victory. 
    if (b[0][0].state == b[1][1].state && b[1][1].state == b[2][2].state) {
      if (b[0][0].state == player)
        return 10;
      else if (b[0][0].state == opponent)
        return -10;
    }

    if (b[0][2].state == b[1][1].state && b[1][1].state == b[2][0].state) {
      if (b[0][2].state == player)
        return 10;
      else if (b[0][2].state == opponent)
        return -10;
    }

    // Else if none of them have won then return 0 
    return 0;
  }

  static minimax(board, depth, isMax, player, opponent) {
    // console.log("a")
    let score = MinMax.evaluate(board, player, opponent);
    // console.log(score)

    // If Maximizer has won the game  
    // return his/her evaluated score 
    if (score >= 10)
      return score;

    // If Minimizer has won the game  
    // return his/her evaluated score 
    if (score <= -10)
      return score;

    // If there are no more moves and  
    // no winner then it is a tie 
    if (!cube.boardFull(board))
      return 0;

    // If this maximizer's move 
    if (isMax) {
      let best = -1000;

      // Traverse all cells 
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // Check if cell is empty 
          if (board[i][j].state == '_') {
            // Make the move 
            board[i][j].state = player;

            // Call minimax recursively and choose 
            // the maximum value 
            best = Math.max(best, MinMax.minimax(board,
              depth + 1, !isMax, player, opponent));
            // console.log(best)

            // Undo the move 
            board[i][j].state = '_';
          }
        }
      }
      return best;
    }

    // If this minimizer's move 
    else {
      let best = 1000;

      // Traverse all cells 
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // Check if cell is empty 
          if (board[i][j].state == '_') {
            // Make the move 
            board[i][j].state = opponent;

            // Call minimax recursively and choose 
            // the minimum value 
            best = Math.min(best, MinMax.minimax(board,
              depth + 1, !isMax, player, opponent));

            // Undo the move 
            board[i][j].state = '_';
          }
        }
      }
      return best;
    }
  }

  static findBestMove(face) {
    let board = cube.getPointsOnFace(face)
    let player = currentPlayer % 2 == 0 ? "X" : "O"
    let opponent = player == "O" ? "X" : "O"
    // console.log(player, opponent)
    let bestMove = {
      face,
      row: -1,
      col: -1,
      points: -1000
    }


    // Traverse all cells, evaluate minimax function  
    // for all empty cells. And return the cell  
    // with optimal value. 
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // Check if cell is empty 
        if (board[i][j].state == '_') {

          // Make the move 
          board[i][j].state = player

          // compute evaluation function for this 
          // move. 
          let moveVal = MinMax.minimax(board, 0, false, player, opponent)
          // console.log(moveVal)

          // Undo the move 
          board[i][j].state = '_'

          // If the value of the current move is 
          // more than the best value, then update 
          // best/ 
          if (moveVal > bestMove.points) {
            bestMove.row = i
            bestMove.col = j
            bestMove.points = moveVal
          }
        }
      }
    }

    // console.log(bestMove)

    //     console.log(bestMove)

    return bestMove;
  }

}