// Witch In Progress — Clicker
var gameState = "START";

// score
var score = 0;

// targets positions
var tx = 300, ty = 300;
var baseSize = 40;
var tSize = baseSize;

// icon cycling
var iconIndex = 0;

// level targets
var L1_TARGET = 20;
var L2_TARGET = 40;
var L3_TARGET = 65;

// lvl 3 timed movement
var lastMoveMs = 0;
var moveInterval = 3000;

// ui positions 
var startBtn = { x: 300, y: 420, w: 220, h: 60 };
var arrowBox = { x: 540, y: 20, w: 60, h: 60 };

// images
var imgCursor;      // custom cursor
var imgStartBg;     // title background
var imgStartBtn;    // "Start" button
var imgCelebrate;   // celebration bg

// Panels & target icons
var panelImgs = [];    // [1],[2],[3]
var iconImgs  = [];    // [0],[1],[2]

// per-level progress
var perLevelScore = 0;

//absolute urls
//add other art and replace some later

function preload() {
  imgStartBg  = loadImage('https://aizillust.github.io/p5js/game/bg1.jpg');
  imgStartBtn = loadImage('https://aizillust.github.io/p5js/game/start.jpg');
  imgCursor   = loadImage('https://aizillust.github.io/p5js/game/cursor.jpg');
  panelImgs[1] = loadImage('https://aizillust.github.io/p5js/game/panel1.jpg');
  panelImgs[2] = loadImage('https://aizillust.github.io/p5js/game/panel2.jpg');
  panelImgs[3] = loadImage('https://aizillust.github.io/p5js/game/panel3.jpg');
  iconImgs[0]  = loadImage('https://aizillust.github.io/p5js/game/icon1.jpg');
  iconImgs[1]  = loadImage('https://aizillust.github.io/p5js/game/icon2.jpg');
  iconImgs[2]  = loadImage('https://aizillust.github.io/p5js/game/icon3.jpg');

}

function setup() {
  createCanvas(600, 600);
  textAlign(CENTER, CENTER);
  textSize(20);
  noCursor();

  resetTarget();
  setLevel(1);
}

function draw() {
  background(220);

  //game state route
  if (gameState == "START")   drawStartScreen();
  else if (gameState == "PANEL1") drawPanel(1);
  else if (gameState == "L1") levelOne();
  else if (gameState == "PANEL2") drawPanel(2);
  else if (gameState == "L2") levelTwo();
  else if (gameState == "PANEL3") drawPanel(3);
  else if (gameState == "L3") levelThree();
  else if (gameState == "CELEB") drawCelebration();

  // HUD
  fill(0);
  noStroke();
  text("Score: " + score, width / 2, 30);

  drawCursor();
}

//Screen
function drawStartScreen() {
  // draw bg (no backup)
  if (imgStartBg) image(imgStartBg, 0, 0, width, height);

  // draw button (no backup rectangle)
  if (imgStartBtn) {
    imageMode(CENTER);
    image(imgStartBtn, startBtn.x, startBtn.y, startBtn.w, startBtn.h);
    imageMode(CORNER);
  }
}

  // draw panel image full canvas (no backup color)

function drawPanel(n) {

  if (panelImgs[n]) image(panelImgs[n], 0, 0, width, height);

  // draw simple next triangle (clickable area stays the same)
  drawArrow();
}

  // celebration image make sure to add 
function drawCelebration() {
  if (imgCelebrate) image(imgCelebrate, 0, 0, width, height);

  textSize(18); fill(50);
  text("Final Score: " + score, width/2, 40);
  text("Press R to return to Title", width/2, 65);
}

// Levels
function levelOne() {
  baseSize = 40;
  tSize = baseSize;

  // guide
  stroke(0);
  line(mouseX, mouseY, tx, ty);

  // target image only
  drawTarget(iconIndex, tx, ty, tSize);

  // promximity for scoring
  var d = dist(tx, ty, mouseX, mouseY);
  if (d < tSize / 2) {
    onHit();
    if (score >= L1_TARGET) { perLevelScore = 0; gameState = "PANEL2"; }
  }

  noStroke(); fill(0); text("Level 1", width/2, height - 20);
}

function levelTwo() {
  noStroke();

  // shrink every 2 points (this level only)
  var shrinkSteps = floor(perLevelScore / 2);
  baseSize = 34;
  tSize = max(14, baseSize - shrinkSteps * 2);

  drawTarget(iconIndex, tx, ty, tSize);

  var d = dist(tx, ty, mouseX, mouseY);
  if (d < tSize / 2) {
    onHit();
    if (score >= L2_TARGET) { perLevelScore = 0; lastMoveMs = millis(); gameState = "PANEL3"; }
  }

  fill(0); text("Level 2", width/2, height - 20);
}

function levelThree() {
  // timed random movement
  if (millis() - lastMoveMs > moveInterval) { resetTarget(); lastMoveMs = millis(); }

  // shrink every point
  var shrinkSteps = perLevelScore;
  baseSize = 28;
  tSize = max(10, baseSize - shrinkSteps);

  noStroke();
  drawTarget(iconIndex, tx, ty, tSize);

  var d = dist(tx, ty, mouseX, mouseY);
  if (d < tSize / 2) {
    onHit();
    if (score >= L3_TARGET) gameState = "CELEB";
  }

  fill(0); text("Level 3", width/2, height - 20);
}

// targets
function drawTarget(styleIndex, x, y, s) {
  var img = iconImgs[styleIndex];
  if (img) {
    imageMode(CENTER);
    image(img, x, y, s, s);
    imageMode(CORNER);
  }
  
}

//scoring
function onHit() {
  score += 1;
  perLevelScore += 1;
  iconIndex = (iconIndex + 1) % 3;
  resetTarget();
}

function resetTarget() {
  tx = random(50, width - 50);
  ty = random(80, height - 80);
}

function setLevel(n) {
  perLevelScore = 0;
  iconIndex = 0;
  baseSize = (n==1)?40:(n==2)?34:28;
  tSize = baseSize;
}

//mouse input
function mousePressed() {
  // start button
  if (gameState == "START" && inside(mouseX, mouseY, startBtn)) {
    gameState = "PANEL1"; setLevel(1); return;
  }

  // panels advance via arrow hitbox
  if (gameState == "PANEL1" || gameState == "PANEL2" || gameState == "PANEL3") {
    if (insideBox(mouseX, mouseY, arrowBox)) {
      if (gameState == "PANEL1") { gameState = "L1"; setLevel(1); }
      else if (gameState == "PANEL2") { gameState = "L2"; setLevel(2); }
      else if (gameState == "PANEL3") { gameState = "L3"; setLevel(3); lastMoveMs = millis(); }
      return;
    }
  }
}

function keyPressed() {
  if (gameState == "CELEB" && (key == 'r' || key == 'R')) {
    score = 0; perLevelScore = 0; setLevel(1); resetTarget(); gameState = "START";
  }
}

 // simple triangle 
  
function drawArrow() {
  noStroke();
  fill(50);
  push();
  translate(arrowBox.x + arrowBox.w/2, arrowBox.y + arrowBox.h/2);
  triangle(-10, -12, -10, 12, 14, 0);
  pop();
}

function inside(px, py, btn) {
  return px > btn.x - btn.w/2 && px < btn.x + btn.w/2 &&
         py > btn.y - btn.h/2 && py < btn.y + btn.h/2;
}

function insideBox(px, py, box) {
  return px > box.x && px < box.x + box.w &&
         py > box.y && py < box.y + box.h;
}


// img cursor
function drawCursor() {
  if (imgCursor) {
    imageMode(CENTER);
    image(imgCursor, mouseX, mouseY, 36, 36);
    imageMode(CORNER);
  }
}
