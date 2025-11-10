var initials ='jc'; //initials
var choice = '4';   // starting choice is 4 which is a pen
var screenbg = 250; // off white background
var lastscreenshot = 61; 

// brush size
var brush2Size  = 3;   // size of brush 4 (pen)
var eraserSize  = 25;  // size of brush 1 (eraser)
var brush4Size  = 40;  // size of brush 2 (Round Opacity Brush)
var brush4Alpha = 60;  // 0–255 transparency for soft brush (tool 2)

// landscape brush images located in same folder
var mountainImg, treeImg, tree2Img, birdImg, flowerImg, groundBrushImg;

function preload() {
  mountainImg    = loadImage('https://aizillust.github.io/p5js/diyps2025/mnt.png');
  treeImg        = loadImage('https://aizillust.github.io/p5js/diyps2025/tree.png');
  tree2Img       = loadImage('https://aizillust.github.io/p5js/diyps2025/tree2.png');
  birdImg        = loadImage('https://aizillust.github.io/p5js/diyps2025/birdbrush.png');
  flowerImg      = loadImage('https://aizillust.github.io/p5js/diyps2025/flower.png');
  groundBrushImg = loadImage('https://aizillust.github.io/p5js/diyps2025/brush1.png');
}

function setup() {
  createCanvas(600, 600);   // canvas size
  background(screenbg);     
  imageMode(CENTER);        
}

function draw() {
  if (keyIsPressed) {
    choice = key;        
    clear_print();       
  }
  if (mouseIsPressed){
    newkeyChoice(choice); 
  }
}

function softRoundStroke(x1, y1, x2, y2) {
  noStroke();
  fill(0, 0, 0, brush4Alpha);
  circle(mouseX, mouseY, brush4Size);
}

function newkeyChoice(toolChoice) { 

  if (toolChoice == '1' ) {  // eraser that just paints bg color
    noStroke();
    fill(screenbg);               
    circle(mouseX, mouseY, eraserSize);

  } else if (toolChoice == '2') {   // opacity round brush 
    softRoundStroke(pmouseX, pmouseY, mouseX, mouseY);

  } else if (toolChoice == '3') {   // hard round gray
    noStroke();
    fill(128);                      
    circle(mouseX, mouseY, 30);     // feel free to change the number to your liking

  } else if (toolChoice == '4') {   // fine line brush
    stroke(0);
    strokeWeight(brush2Size);
    line(mouseX, mouseY, pmouseX, pmouseY);

  } else if (toolChoice == '5') {   //mountain
    image(mountainImg, mouseX, mouseY);

  } else if (toolChoice == '6') {   //tree
    image(treeImg, mouseX, mouseY);

  } else if (toolChoice == '7') {   //tree2
    image(tree2Img, mouseX, mouseY);

  } else if (toolChoice == '8') {   //birds
    image(birdImg, mouseX, mouseY);

  } else if (toolChoice == '9') {   //flower
    image(flowerImg, mouseX, mouseY);

  } else if (toolChoice == '0') {   //brush
    image(groundBrushImg, mouseX, mouseY);
  }
}


function clear_print() {
  if (key == 'x' || key == 'X') {
    background(screenbg);  
  } else if (key == 'p' || key == 'P') {
    saveme();              
  }
}

function saveme(){
  filename = initials + day() + hour() + minute() + second();
  if (second() != lastscreenshot) { 
    saveCanvas(filename, 'jpg');
    key = "";
  }
  lastscreenshot = second();
}
