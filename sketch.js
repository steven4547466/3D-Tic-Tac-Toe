let cam;
let bx;
let by;
let offsetX;
let offsetY;

let ray;
let dirV;
let selected;
let cube;

let currentPlayer;
let gameOver;
let gameStarted;

let font;

let delta = 0;
let previousMoves = [];

function preload() {
  font = loadFont("ArialCE.ttf")
}

function setup(start) {
  createCanvas(800, 800, WEBGL);
  cam = createCamera();
  cube = new Cube();
  textFont(font);
  if (start) {
    gameStarted = true;
    bx = 0;
    by = 0;
    offsetX = width / 2;
    offsetY = width / 2;
    ray = null;
    dirV = [];
    currentPlayer = 0;
    gameOver = false;
    delta = 0;
    previousMoves = [];
    cam.setPosition(0, 0, 900)
  } else {
    gameStarted = false;
  }
}

function draw() {
  background("#4f4f4f");
  ambientLight(60, 60, 60);

  if (!gameStarted) {
    for (let i = 0; i < cube.points.length; i++) {
      for (let j = 0; j < cube.points[i].length; j++) {
        for (let k = 0; k < cube.points[i][j].length; k++) {

          cube.points[i][j][k].shape.color = [200, 200, 200];

          cube.points[i][j][k].shape.draw();
        }
      }
    }

    cam.setPosition(800 * sin(delta), 200 * cos(delta), 800 * cos(delta));
    delta += 0.01;
    cam.lookAt(0, 0, 0)
    push();
    rotateY(frameCount * sin(delta / frameCount));
    textSize(width / 5);
    textAlign(CENTER, CENTER);
    text("Welcome to", 0, -250);
    textSize(width / 6);
    text("3D Tic Tac Toe!", 0, 100);
    textSize(width / 8);
    text("R to play.", 0, 350);
    pop();
    return;
  }

  if (!gameOver) {

    if (keyIsDown(87)) {
      cam.move(0, 0, -5);
    }
    if (keyIsDown(83)) {
      cam.move(0, 0, 5);
    }
    if (keyIsDown(68)) {
      cam.move(5, 0, 0);
    }
    if (keyIsDown(65)) {
      cam.move(-5, 0, 0);
    }
    if (keyIsDown(81)) {
      cam.move(0, -5, 0);
    }
    if (keyIsDown(69)) {
      cam.move(0, 5, 0);
    }
    ray = [cam.eyeX, cam.eyeY, cam.eyeZ, cam.centerX, cam.centerY, cam.centerZ]
    dirV = [cam.eyeX - cam.centerX, cam.eyeY - cam.centerY, cam.eyeZ - cam.centerZ]
  }
  let lastHit = null
  let lastHitDist = Number.MAX_SAFE_INTEGER;

  let hits = []
  for (let i = 0; i < cube.points.length; i++) {
    for (let j = 0; j < cube.points[i].length; j++) {
      for (let k = 0; k < cube.points[i][j].length; k++) {
        if (cube.points[i][j][k].state != "_") {
          cube.points[i][j][k].shape.draw();
          continue;
        }
        cube.points[i][j][k].shape.color = [200, 200, 200];
        if (!gameOver && cube.points[i][j][k].shape.hit(-1, 1)) {
          hits.push(cube.points[i][j][k]);
          // console.log(cubes[i].rX, cubes[i].rY, cubes[i].rZ)
        }
        cube.points[i][j][k].shape.draw();
      }
    }
  }

  if (!gameOver) {
    for (let i = 0; i < hits.length; i++) {
      let point = hits[i];
      let pointDist = point.distanceToCamera();
      if (pointDist < lastHitDist) {
        lastHit = point;
        lastHitDist = pointDist;
      }
    }
  }

  if (!gameOver && lastHit) {
    // console.log("selected")
    selected = lastHit;
    lastHit.shape.color = [0, 255, 0];
    lastHit.shape.draw();
  } else if (!lastHit) {
    selected = null;
  }

  if (gameOver) {
    cam.setPosition(800 * sin(delta), 200 * cos(delta), 800 * cos(delta));
    delta += 0.01;
    cam.lookAt(0, 0, 0)
    push();
    rotateY(frameCount * sin(delta / frameCount));
    textSize(width / 3);
    textAlign(CENTER, CENTER);
    text("Winner", 0, -350);
    text(`is ${currentPlayer % 2 == 1 ? "X" : "O"}!`, 0, 0);
    textSize(width / 8);
    text("R to play again.", 0, 350);
    pop();
  }


}

function keyPressed() {
  if (keyCode == 82) {
    // console.log(selected.rX, selected.rY, selected.rZ)

    if (!gameStarted) {
      setup(true);
      return;
    }

    if (!gameOver) {
      if (selected != null && selected.state == "_") {
        // console.log(selected.rX, selected.rY, selected.rZ)
        let player = currentPlayer % 2;
        selected.shape = player == 0 ? new XShape(selected, 40) : new OShape(selected, 20);
        selected.state = player == 0 ? "X" : "O";
        previousMoves.unshift(selected);

        if (cube.checkWin()) {
          console.log("Winner!");
          gameOver = true;
          cam.lookAt(0, 0, 0);
          cam.setPosition(0, 0, 800);
        }

        currentPlayer++;
      }
    } else {
      setup(true);
    }
  } else if (keyCode == 70) {
    if (gameOver || !gameStarted) return;
    if (previousMoves.length == 0) return;
    let point = previousMoves.shift();
    point.state = "_";
    point.shape = new Box(point, 40);
    currentPlayer--;
  } else if (keyCode == 84) {
    if (gameOver || !gameStarted) return;
    let player = currentPlayer % 2;
    let diagonalThroughCubeMove = MinMax.checkDiagonalThroughCube()
    let move;
    let point;
    if(!diagonalThroughCubeMove || cube.getPoint(diagonalThroughCubeMove.rX, diagonalThroughCubeMove.rY, diagonalThroughCubeMove.rZ).state != "_") {
      let moves = [];
      let faces = ["FRONT", "RIGHT", "BACK", "LEFT", "TOP", "BOTTOM", "HORIZONTAL", "VERTICALX", "VERTICALZ"]
      for (let i = 0; i < faces.length; i++) {
        moves.push(MinMax.findBestMove(faces[i]))
      }
      let previousMoveFaces = previousMoves[0] ? previousMoves[0].getFaces() : faces;
      let firstCheck = moves.filter(m => previousMoveFaces.includes(m.face))
      firstCheck.sort((a, b) => b.points - a.points);
      console.log(firstCheck)
      if (firstCheck[0] && firstCheck[0].points >= 10) move = firstCheck[0]
      else {
        moves.sort((a, b) => b.points - a.points);
        // console.log(previousMoves[0] ? previousMoves[0].getFaces() : null)
        move = moves[0];
      }
      // console.log(points)
      point = cube.getPointsOnFace(move.face)[move.row][move.col];
    }else {
      point = cube.getPoint(diagonalThroughCubeMove.rX, diagonalThroughCubeMove.rY, diagonalThroughCubeMove.rZ);
    }
    point.shape = player == 0 ? new XShape(point, 40) : new OShape(point, 20);
    point.state = player == 0 ? "X" : "O";
    previousMoves.unshift(point);

    if (cube.checkWin()) {
      console.log("Winner!");
      gameOver = true;
      cam.lookAt(0, 0, 0);
      cam.setPosition(0, 0, 800);
    }

    currentPlayer++;
  }
}

function mousePressed() {
  if (gameOver) return;
  offsetX = mouseX - bx;
  offsetY = mouseY - by;
}

function mouseWheel(e) {
  if (gameOver || !gameStarted) return
  if (e.delta > 0) {
    cam.move(0, 0, 15)
  } else {
    cam.move(0, 0, -15)
  }
}

function mouseDragged(e) {
  if (gameOver) return;
  let px = bx;
  let py = by;
  bx = mouseX - offsetX;
  by = mouseY - offsetY;
  let up = by > py;
  let down = by < py;
  let left = px < bx;
  let right = px > bx;

  cam.tilt(up ? 0.01 * Math.abs(py - by) * 0.3 : down ? -0.01 * Math.abs(py - by) * 0.3 : 0)
  cam.pan(right ? 0.01 * Math.abs(px - bx) * 0.3 : left ? -0.01 * Math.abs(px - bx) * 0.3 : 0);
}

class Box {

  constructor(point, size, checker) {
    // this.thetastart = atan2(z, x);
    this.size = size;
    this.boundsMin = [point.x - size, point.y - size, point.z - size];
    this.boundsMax = [point.x + size, point.y + size, point.z + size];
    this.color = [200, 200, 200];
    this.point = point;
    this.checker = checker
  }

  hit(t0, t1, debug) {
    let tmin, tmax, tymin, tymax, tzmin, tzmax;

    if (dirV[0] >= 0) {
      tmin = (this.boundsMin[0] - ray[0]) / dirV[0];
      tmax = (this.boundsMax[0] - ray[0]) / dirV[0];
    } else {
      tmin = (this.boundsMax[0] - ray[0]) / dirV[0];
      tmax = (this.boundsMin[0] - ray[0]) / dirV[0];
    }

    if (dirV[1] >= 0) {
      tymin = (this.boundsMin[1] - ray[1]) / dirV[1];
      tymax = (this.boundsMax[1] - ray[1]) / dirV[1];
    } else {
      tymin = (this.boundsMax[1] - ray[1]) / dirV[1];
      tymax = (this.boundsMin[1] - ray[1]) / dirV[1];
    }

    if(debug) console.log(tmin, tymax, tymin, tmax)
    if ((tmin > tymax) || (tymin > tmax)) return false;

    if (tymin > tmin) tmin = tymin;
    if (tymax < tmax) tmax = tymax;

    if (dirV[2] >= 0) {
      tzmin = (this.boundsMin[2] - ray[2]) / dirV[2];
      tzmax = (this.boundsMax[2] - ray[2]) / dirV[2];
    } else {
      tzmin = (this.boundsMax[2] - ray[2]) / dirV[2];
      tzmax = (this.boundsMin[2] - ray[2]) / dirV[2];
    }

    if(debug) console.log(tmin, tzmax, tzmin, tmax)
    if ((tmin > tzmax) || (tzmin > tmax)) return false;

    if (tzmin > tmin) tmin = tzmin;
    if (tzmax < tmax) tmax = tzmax;
    if(debug) console.log(tmin, tmax, t1, t0)
    return ((tmin < t1) && (tmax > t0));
  }

  draw() {
    push();
    translate(this.point.x, this.point.y, this.point.z);
    // let dir = atan2(cam.eyeY - this.point.y, cam.eyeX - this.point.X)
    // rotateY(dir);
    // rotateZ(dir);
    // let rot = this.point.rotationToCamera();
    // // console.log(rot)
    // rotateX(rot[0]);
    // rotateY(rot[1]);
    if(this.checker) strokeWeight(5);
    fill(this.color[0], this.color[1], this.color[2], this.color[3] === undefined ? 255 : this.color[3]);
    box(this.size);
    pop();
  }
}

class XShape {
  constructor(point, size) {
    // this.thetastart = atan2(z, x);
    this.size = size;
    this.point = point;
    this.color = [255, 0, 0];
  }

  draw() {
    push();
    translate(this.point.x, this.point.y, this.point.z)
    rotateY(300)
    rotateX(180)
    fill(this.color[0], this.color[1], this.color[2])
    box(10, this.size, 10);
    rotateZ(0);
    rotateX(300);
    rotateY(0);
    box(10, this.size, 10);
    pop();
  }
}

class OShape {
  constructor(point, radius) {
    // this.thetastart = atan2(z, x);
    this.radius = radius;
    this.point = point;
    this.color = [0, 0, 255];
  }

  draw() {
    push();
    translate(this.point.x, this.point.y, this.point.z);
    fill(this.color[0], this.color[1], this.color[2]);
    torus(this.radius, this.radius / 5, 64, 64);
    pop();
  }
}

class Cube {
  constructor() {
    this.points = []
    let counter = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        for (let k = -1; k < 2; k++) {
          let divisorX = i == -1 ? 0 : i == 0 ? 3 : -3;
          let divisorY = j == -1 ? 0 : j == 0 ? 3 : -3;
          let divisorZ = k == -1 ? 0 : k == 0 ? 3 : -3;
          // rotateX(frameCount * 0.01);
          // rotateY(frameCount * 0.01);
          // rotateZ(frameCount * 0.01);

          let x = (divisorX / 3) + 1;
          let y = -((divisorY / 3) - 1);
          let z = -((divisorZ / 3) - 1);
          if (!this.points[x]) this.points[x] = [];
          if (!this.points[x][y]) this.points[x][y] = [];
          this.points[x][y][z] =
            new Point3D(divisorX == 0 ? 0 : width / divisorX,
              divisorY == 0 ? 0 : width / -divisorY,
              divisorZ == 0 ? 0 : width / divisorZ,
              divisorX / 3, divisorY / 3, divisorZ / 3);
          counter++;
        }
      }
    }
  }

  getPoint(x, y, z) {
    return this.points[x + 1][(y - 1) * -1][(z - 1) * -1];
  }

  getOpenPoints() {
    let points = [];
    for (let i = 0; i < this.points.length; i++) {
      for (let j = 0; j < this.points[i].length; j++) {
        points = points.concat(this.points[i][j].filter(p => p.state == "_"))
      }
    }
    return points;
  }

  getPointsOnFace(face) {
    let returnedPoints = [
      [],
      [],
      []
    ];
    let counterX = 0;
    let counterY = 0;

    switch (face) {
      case "FRONT":
        for (let i = 1; i > -2; i--) {
          for (let j = -1; j < 2; j++) {
            returnedPoints[counterX][counterY++] = this.getPoint(j, i, 1);
          }
          counterX++;
          counterY = 0;
        }
        break;
      case "RIGHT":
        for (let i = 1; i > -2; i--) {
          for (let j = 1; j > -2; j--) {
            returnedPoints[counterX][counterY++] = this.getPoint(1, i, j);
          }
          counterX++;
          counterY = 0;
        }
        break;
      case "BACK":
        for (let i = 1; i > -2; i--) {
          for (let j = 1; j > -2; j--) {
            returnedPoints[counterX][counterY++] = this.getPoint(j, i, -1);
          }
          counterX++;
          counterY = 0;
        }
        break;
      case "LEFT":
        for (let i = 1; i > -2; i--) {
          for (let j = -1; j < 2; j++) {
            returnedPoints[counterX][counterY++] = this.getPoint(-1, i, j);
          }
          counterX++;
          counterY = 0;
        }
        break;
      case "TOP":
        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            returnedPoints[counterX][counterY++] = this.getPoint(j, 1, i);
          }
          counterX++;
          counterY = 0;
        }
        break;
      case "BOTTOM":
        for (let i = 1; i > -2; i--) {
          for (let j = -1; j < 2; j++) {
            returnedPoints[counterX][counterY++] = this.getPoint(j, -1, i);
          }
          counterX++;
          counterY = 0;
        }
        break;
      case "HORIZONTAL":
        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            returnedPoints[counterX][counterY++] = this.getPoint(j, 0, i);
          }
          counterX++;
          counterY = 0;
        }
        break;
      case "VERTICALX":
        for (let i = 1; i > -2; i--) {
          for (let j = -1; j < 2; j++) {
            returnedPoints[counterX][counterY++] = this.getPoint(j, i, 0);
          }
          counterX++;
          counterY = 0;
        }
        break;
      case "VERTICALZ":
        for (let i = 1; i > -2; i--) {
          for (let j = 1; j > -2; j--) {
            returnedPoints[counterX][counterY++] = this.getPoint(0, i, j);
          }
          counterX++;
          counterY = 0;
        }
        break;
    }
    return returnedPoints;
  }

  checkWin() {
    // console.log("----")
    // console.log(this.getPoint(0,0,0).state)
    if (this.getPoint(0, 0, 0).state != '_') { // We can prune 13 win conditions right off the bat
      if (this.checkThroughMiddleWin()) {
        // console.log("Through middle win")
        return true;
      }
    } else {
      // console.log("Not through middle win")
    }

    let faces = ["FRONT", "RIGHT", "BACK", "LEFT", "TOP", "BOTTOM"]
    for (let i = 0; i < 6; i++) {
      // console.log(`Checking win for face: ${faces[i]}`)
      let points = this.getPointsOnFace(faces[i]);
      if (this.checkRowWin(points) || this.checkColWin(points) ||
        this.checkDiagonalWin(points)) {
        // console.log(`Win on face ${faces[i]}`)  
        return true;
      }
    }

    return false;
  }

  checkThroughMiddleWin() {
    for (let x = -1; x < 2; x++) {
      for (let y = -1; y < 2; y++) {
        for (let z = -1; z < 2; z++) {
          if (x == 0 && y == 0 && z == 0) return false; // don't evaluate 0, 0, 0 or the flip.
          if (this.getPoint(0, 0, 0).state == this.getPoint(x, y, z).state &&
            this.getPoint(0, 0, 0).state == this.getPoint(-x, -y, -z).state)
            return true;
        }
      }
    }
    // console.log("Not through middle win");
    return false;
  }

  checkRowWin(board) {
    for (let i = 0; i < board.length; i++) {
      let row = board[i];
      if (row[0].state == '_') continue;
      if (row[0].state == row[1].state && row[1].state == row[2].state)
        return true;
    }
    // console.log("Not row win");
    return false;
  }

  checkColWin(board) {
    for (let i = 0; i < board.length; i++) {
      if (board[0][i].state == '_') continue;
      if (board[0][i].state == board[1][i].state &&
        board[1][i].state == board[2][i].state)
        return true;
    }
    // console.log("Not col win");
    return false;
  }

  checkDiagonalWin(board) {
    if ((board[0][0].state != '_' && board[0][0].state == board[1][1].state &&
        board[1][1].state == board[2][2].state) ||
      (board[0][2].state != '_' && board[0][2].state == board[1][1].state &&
        board[1][1].state == board[2][0].state))
      return true;

    // console.log("Not diagonal win");
    return false;
  }

  boardFull(board) {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] == "_") return false
      }
    }
    return true
  }

}

class Point3D {
  constructor(x, y, z, rX, rY, rZ) {
    this.state = '_';
    this.x = x;
    this.y = y;
    this.z = z;
    this.rX = rX
    this.rY = rY
    this.rZ = rZ
    this.shape = new Box(this, 40);
  }

  distanceToCamera() {
    return Math.sqrt(Math.pow(this.x - cam.eyeX, 2) + Math.pow(this.z - cam.eyeY, 2) + Math.pow(this.z - cam.eyeZ, 2))
  }

  rotationToCamera() {
    return [atan((cam.eyeY - this.y) / (Math.abs(cam.eyeX) - Math.abs(this.x))), atan((cam.eyeY - this.y) / (Math.abs(cam.eyeZ) - Math.abs(this.z)))]
  }

  getFaces() {
    let faces = []
    switch (this.rX) {
      case -1:
        faces.push("LEFT")
        break;

      case 0:
        faces.push("VERTICALZ")
        break;

      case 1:
        faces.push("RIGHT")
        break;
    }

    switch (this.rY) {
      case -1:
        faces.push("BOTTOM")
        break;

      case 0:
        faces.push("HORIZONTAL")
        break;

      case 1:
        faces.push("TOP")
        break;
    }

    switch (this.rZ) {
      case -1:
        faces.push("BACK")
        break;

      case 0:
        faces.push("VERTICALX")
        break;

      case 1:
        faces.push("FRONT")
        break;
    }
    return faces
  }

  //   radToDeg(rad) {
  //     return rad * 180 / Math.PI;
  //   }
}

class AI {
  constructor() {
    this.net = new brain.NeuralNetwork().fromJSON(document.getElementByID("brain-json").innerHTML)
  }
}

























