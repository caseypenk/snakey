let width = 1000
let height = 800
let energyLinks = []
let enemyLinks = []
let snakeLinks = []
let lastMove = -100
let currentDirection = "up"
let currentScore = 0
let currentRound = 0
let achievements = []
let nPoisonings = 0
let nDeaths = 0

class Link {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class Achievement {
  constructor(title, description) {
    this.title = title
    this.description = description
  }
}

function setup() {
  createCanvas(width, height)
  advanceRounds()
  for (let i = 0; i < 1; i++) {
    snakeLinks.push(new Link(width/2 - 20, height/2))
  }
}

function draw() {
  background("black")
  getCurrentDirection()
  checkSelfEating()
  checkEating()
  checkPoisoning()
  autoMove()
  advanceRounds()
  displayEnergyLinks()
  displayEnemyLinks()
  displaySnakeLinks()
  displayStatistics()
  checkAchievements()
  displayAchievements()
}

// determine current direction to travel based on which key is pressed
function getCurrentDirection() {
  if (keyIsDown(UP_ARROW)) {
    currentDirection = "up"
    if (frameCount - lastMove >= 10) choiceMove()
  }

  if (keyIsDown(DOWN_ARROW)) {
    currentDirection = "down"
    if (frameCount - lastMove >= 10) choiceMove()
  }

  if (keyIsDown(LEFT_ARROW)) {
    currentDirection = "left"
    if (frameCount - lastMove >= 10) choiceMove()
  }

  if (keyIsDown(RIGHT_ARROW)) {
    currentDirection = "right"
    if (frameCount - lastMove >= 10) choiceMove()
  }
}

// update positions of each link to be the previous position of the link ahead of it
function moveSnakeLinks() {
  for (let i = snakeLinks.length - 1; i > 0; i--) {
    snakeLinks[i].x = snakeLinks[i-1].x
    snakeLinks[i].y = snakeLinks[i-1].y
  }
}

// eat energy links that are at the front of the snake
function checkEating() {
  for (let i = 0; i < energyLinks.length; i++) {
    if (snakeLinks[0].x == energyLinks[i].x && snakeLinks[0].y == energyLinks[i].y) {
      let transferLink = energyLinks[i]
      if (currentDirection == "up") {
        transferLink.x = snakeLinks[snakeLinks.length - 1].x
        transferLink.y = snakeLinks[snakeLinks.length - 1].y + 40
      } else if (currentDirection == "down") {
        transferLink.x = snakeLinks[snakeLinks.length - 1].x
        transferLink.y = snakeLinks[snakeLinks.length - 1].y - 40
      } else if (currentDirection == "left") {
        transferLink.x = snakeLinks[snakeLinks.length - 1].x + 40
        transferLink.y = snakeLinks[snakeLinks.length - 1].y
      } else {
        transferLink.x = snakeLinks[snakeLinks.length - 1].x - 40
        transferLink.y = snakeLinks[snakeLinks.length - 1].y
      }
      snakeLinks.push(transferLink)
      currentScore += currentRound
      energyLinks.splice(i, 1)
    }
  }
}

// disallow overlapping with your own body
function checkSelfEating() {
  for (let i = 1; i < snakeLinks.length; i++) {
    if (snakeLinks[0].x == snakeLinks[i].x && snakeLinks[0].y == snakeLinks[i].y) {
      resetGame()
    }
  }
}

function checkPoisoning() {
  for (let i = 0; i < enemyLinks.length; i++) {
    if (snakeLinks[0].x == enemyLinks[i].x && snakeLinks[0].y == enemyLinks[i].y) {
      nPoisonings++
      currentScore -= currentRound * 2
      enemyLinks.splice(i, 1)
      if (snakeLinks.length > 1) {
        snakeLinks.pop()
      } else {
        resetGame()
      }
    }
  }
}

// automatically move the snake in a given direction to keep up dramatic pace of game
function autoMove() {
  if (frameCount % 30 == 0) {
    if (currentDirection == "up" && snakeLinks[0].y > 40) {
      moveSnakeLinks()
      snakeLinks[0].y -= 40
    }
    if (currentDirection == "down" && snakeLinks[0].y < height) {
      moveSnakeLinks()
      snakeLinks[0].y += 40
    }
    if (currentDirection == "left" && snakeLinks[0].x > 0) {
      moveSnakeLinks()
      snakeLinks[0].x -= 40
    }
    if (currentDirection == "right" && snakeLinks[0].x < width - 40) {
      moveSnakeLinks()
      snakeLinks[0].x += 40
    }
  }
}

// move using keyboard
function choiceMove() {
  if (currentDirection == "up" && snakeLinks[0].y > 40) {
    moveSnakeLinks()
    snakeLinks[0].y -= 40
  } else if (currentDirection == "down" && snakeLinks[0].y < height) {
    moveSnakeLinks()
    snakeLinks[0].y += 40
  } else if (currentDirection == "left"  && snakeLinks[0].x > 0) {
    moveSnakeLinks()
    snakeLinks[0].x -= 40
  } else if (currentDirection == "right" && snakeLinks[0].x < width - 40) {
    moveSnakeLinks()
    snakeLinks[0].x += 40
  }
  lastMove = frameCount
}

// end the game and reset to defaults
function resetGame() {
  snakeLinks = []
  energyLinks = []
  enemyLinks = []
  currentRound = 0
  currentScore = 0
  setup()
  nDeaths++
}

// move on to the next round, with more enemies and more energy than the previous round
function advanceRounds() {
  if (energyLinks.length == 0) {
    enemyLinks = [] // clear enemies from previous round
    snakeLinks.splice(0, snakeLinks.length - 1)

    for (let i = 0; i < 5 * (currentRound + 1); i++) {
      energyLinks.push(new Link(floor(random(width/40)) * 40, floor(random(height/40)) * 40 + 40))
    }

    for (let i = 0; i < 2 * (currentRound + 1); i++) {
      let newX = floor(random(width/40)) * 40
      let newY = floor(random(height/40)) * 40 + 40
      for (let i = 0; i < energyLinks.length; i++) {
        while (newX == energyLinks[i].x && newY == energyLinks[i].y) {
          newX = floor(random(width/40)) * 40
          newY = floor(random(height/40)) * 40 + 40
        }
      }
      enemyLinks.push(new Link(newX, newY))
    }
    currentRound++
  }
}

function displayStatistics() {
  textSize(20)
  fill("white")
  if (currentScore < 0) currentScore = 0
  text("score = " + currentScore, 30, 40)
  text("round " + currentRound, 30, 80)
}

function displayEnergyLinks() {
  for (let i = 0; i < energyLinks.length; i++) {
    textSize(40)
    text("🍪", energyLinks[i].x, energyLinks[i].y)
  }
}

function displaySnakeLinks() {
  for (let i = 0; i < snakeLinks.length; i++) {
    textSize(40)
    text("🐍", snakeLinks[i].x, snakeLinks[i].y)
  }
}

function displayEnemyLinks() {
  for (let i = 0; i < enemyLinks.length; i++) {
    textSize(40)
    text("☠️", enemyLinks[i].x, enemyLinks[i].y)
  }
}

function checkAchievements() {
  if (snakeLinks.length > 1) {
    achievements[0] = new Achievement("🧠 big brain moves", "eat some energy")
  }
  if (currentRound >= 2) {
    achievements[1] = new Achievement("👋 hello there", "reach round 2")
  }
  if (currentScore >= 100) {
    achievements[2] = new Achievement("🧨 that's a lot of damage", "score at least 100")
  }
  if (nPoisonings > 0) {
    achievements[3] = new Achievement("🤢 instant regret", "eat poison")
  }
  if (nDeaths > 0) {
    achievements[4] = new Achievement("☠️ literally dead", "die and get reborn")
  }
}

function displayAchievements() {
  text("achievements", 30, 160)
  for (let i = 0; i < achievements.length; i++) {
    textSize(20)
    if (achievements[i] != undefined) text(achievements[i].title + ": " + achievements[i].description, 30, 200 + 40 * i)
  }
}
