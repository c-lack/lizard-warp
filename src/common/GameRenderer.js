// GameRenderer.js

let ctx_trail = null;
let canvas_trail = null;
let ctx_lizard = null;
let canvas_lizard = null;
let game = null;

let lizardImage = new Image();
lizardImage.src = "/sprites/lizard.png";

let graveImage = new Image();
graveImage.src = "/sprites/grave.png";

let shift = 0;
let frameWidth = 150;
let frameHeight = 150;
let totalFrames = 4;
let currentFrame = 0;
let frameCount = 0;

class GameRenderer {
  constructor(g) {
    game = g;

    // Set up trail canvas
    canvas_trail = document.createElement('canvas');
    canvas_trail.width = Math.min(window.innerWidth,window.innerHeight);
    canvas_trail.height = Math.min(window.innerWidth,window.innerHeight);
    document.body.insertBefore(canvas_trail, document.getElementById('root'));
    ctx_trail = canvas_trail.getContext('2d');

    // Set up lizard canvas
    canvas_lizard = document.createElement('canvas');
    canvas_lizard.width = Math.min(window.innerWidth,window.innerHeight);
    canvas_lizard.height = Math.min(window.innerWidth,window.innerHeight);
    document.body.insertBefore(canvas_lizard, document.getElementById('root'));
    ctx_lizard = canvas_lizard.getContext('2d');

    // draw bounds
    this.draw_bounds();
  }

  draw() {
    // Clear the lizard canvas
    ctx_lizard.clearRect(0,0,canvas_lizard.width, canvas_lizard.height);

    // Translate to center
    ctx_trail.save();
    ctx_trail.translate(canvas_trail.width/2, canvas_trail.height/2);
    ctx_trail.scale(canvas_trail.width,canvas_trail.height);

    ctx_lizard.save();
    ctx_lizard.translate(canvas_lizard.width/2, canvas_lizard.height/2);
    ctx_lizard.scale(canvas_lizard.width,canvas_lizard.height);

    // Draw all lizards and trails
    game.players.forEach(l => {
      if (this.get_color(l.pos.x,l.pos.y)) {
        game.kill_lizard(l);
      }
      if (l.health && l.trail) {
        this.draw_trail(l);
      }
      if (l.health) {
        this.draw_lizard(l);
      } else {
        this.draw_grave(l);
      }
    });

    // restore canvas
    ctx_trail.restore();
    ctx_lizard.restore();
  }

  draw_trail(l) {
    ctx_trail.save();
    ctx_trail.translate(l.pos.x,l.pos.y);
    ctx_trail.rotate(l.dir + Math.PI/2);
    ctx_trail.beginPath();
    ctx_trail.arc(0,0,0.005,0,Math.PI);
    ctx_trail.fillStyle = l.color.code;
    ctx_trail.fill();
    ctx_trail.closePath();
    ctx_trail.restore();
  }

  draw_lizard(l) {
    let radius = 0.05
    ctx_lizard.save();
    ctx_lizard.translate(l.pos.x,l.pos.y);
    ctx_lizard.rotate(l.dir + Math.PI/2);
    ctx_lizard.drawImage(lizardImage, shift, 0, frameWidth, frameHeight,
      -0.5*radius,-0.5*radius, radius, radius);
    ctx_lizard.restore();

    // Calculations for animation speed
    // TODO: Change 16 to be dependent on speed
    if (frameCount < 0.032/l.speed) {
      frameCount ++;
      return
    }

    frameCount = 0;
    shift += (frameWidth + 1);
    if (currentFrame == totalFrames) {
      shift = 0;
      currentFrame = 0;
    }
    currentFrame++;
  }

  draw_grave(l) {
    let size = 0.05
    ctx_lizard.drawImage(graveImage, 0, 0, 150, 150,
      l.pos.x-0.5*size, l.pos.y-0.5*size, size, size);
     }

  draw_bounds() {
    ctx_trail.strokeStyle = 'white';
    ctx_trail.lineWidth = 0.01;
    ctx_trail.save();
    ctx_trail.translate(canvas_trail.width/2, canvas_trail.height/2);
    ctx_trail.scale(canvas_trail.width,canvas_trail.height);
    ctx_trail.beginPath();
    ctx_trail.moveTo(-0.5, -0.5);
    ctx_trail.lineTo(-0.5, 0.5);
    ctx_trail.lineTo( 0.5, 0.5);
    ctx_trail.lineTo( 0.5, -0.5);
    ctx_trail.lineTo(-0.5, -0.5);
    ctx_trail.stroke();
    ctx_trail.closePath();
    ctx_trail.restore();
  }

  get_color(x,y) {
    let X = canvas_trail.width*(x+0.5);
    let Y = canvas_trail.height*(y+0.5);
    let dat = ctx_trail.getImageData(X-2,Y-2,5,5).data;
    let flag = true;
    dat.forEach(pix => {
      if (pix === 0) {
        flag = false;
      }
    });
    return flag;
  }
}

exports.GameRenderer = GameRenderer;
