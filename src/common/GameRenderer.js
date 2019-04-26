// GameRenderer.js
var Victor = require('victor');

let config = require('./config.json');

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
    canvas_trail.setAttribute("id", "canvas_trail");
    canvas_trail.width = Math.min(window.innerWidth,window.innerHeight);
    canvas_trail.height = Math.min(window.innerWidth,window.innerHeight);
    document.body.insertBefore(canvas_trail, document.getElementById('root'));
    ctx_trail = canvas_trail.getContext('2d');

    // Set up lizard canvas
    canvas_lizard = document.createElement('canvas');
    canvas_lizard.setAttribute("id", "canvas_lizard");
    canvas_lizard.width = Math.min(window.innerWidth,window.innerHeight);
    canvas_lizard.height = Math.min(window.innerWidth,window.innerHeight);
    document.body.insertBefore(canvas_lizard, document.getElementById('root'));
    ctx_lizard = canvas_lizard.getContext('2d');
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
      if (l.health && l.trail) {
        this.draw_trail(l);
      }
      if (l.health) {
        this.draw_lizard(l);
      } else {
        this.draw_grave(l);
      }
      // this.draw_col_points(this.get_collision_points(l));
      this.get_collision_points(l).forEach(p => {
        if (this.get_color(p)) {
          game.kill_lizard(l);
        }
      });
    });

    // draw_bounds
    this.draw_bounds();

    // restore canvas
    ctx_trail.restore();
    ctx_lizard.restore();
  }

  draw_trail(l) {
    if (l.prev_pos) {
      ctx_trail.strokeStyle = l.color.code;
      ctx_trail.lineWidth = config.trail_width;

      ctx_trail.beginPath();
      ctx_trail.moveTo(l.prev_pos[0].x,l.prev_pos[0].y);
      l.prev_pos.forEach(p => {
        ctx_trail.lineTo(p.x,p.y);
      })
      ctx_trail.lineTo(l.pos.x,l.pos.y);
      ctx_trail.stroke();
      ctx_trail.closePath();
    }
    // ctx_trail.save();
    // ctx_trail.translate(l.pos.x,l.pos.y);
    // ctx_trail.rotate(l.dir + Math.PI/2);
    // ctx_trail.beginPath();
    // ctx_trail.arc(0,0,config.trail_width,0,Math.PI);
    // ctx_trail.fillStyle = l.color.code;
    // ctx_trail.fill();
    // ctx_trail.closePath();
    // ctx_trail.restore();
  }

  draw_lizard(l) {
    let radius = config.lizard_radius
    ctx_lizard.save();
    ctx_lizard.translate(l.pos.x,l.pos.y);
    ctx_lizard.rotate(l.dir + Math.PI/2);
    ctx_lizard.drawImage(lizardImage, shift, 0, frameWidth, frameHeight,
      -0.5*radius,-0.5*radius, radius, radius);
    ctx_lizard.restore();

    // Calculations for animation speed
    // TODO: Change 16 to be dependent on speed
    if (frameCount < config.frame_rate_scaler/l.speed) {
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
    let size = config.grave_size;
    ctx_lizard.drawImage(graveImage, 0, 0, 150, 150,
      l.pos.x-0.5*size, l.pos.y-0.5*size, size, size);
     }

  draw_bounds() {
    ctx_trail.strokeStyle = 'white';
    ctx_trail.lineWidth = config.border_width;

    ctx_trail.beginPath();
    ctx_trail.moveTo(config.min_board, config.min_board);
    ctx_trail.lineTo(config.min_board, config.max_board);
    ctx_trail.lineTo( config.max_board, config.max_board);
    ctx_trail.lineTo( config.max_board, config.min_board);
    ctx_trail.lineTo(config.min_board, config.min_board);
    ctx_trail.stroke();
    ctx_trail.closePath();
  }

  get_color(p) {
    let X = canvas_trail.width*(p.x+config.max_board);
    let Y = canvas_trail.height*(p.y+config.max_board);
    let dat = ctx_trail.getImageData(X,Y,1,1).data;
    let flag = true;
    dat.forEach(pix => {
      if (pix === 0) {
        flag = false;
      }
    });
    return flag;
  }

  get_collision_points(l) {
    let col_points = [];
    for (let i = -1; i <= 1; i++) {
      let theta = i*Math.PI/4;
      let rot = new Victor(
        config.lizard_collide_dist*Math.cos(theta + l.dir),
        config.lizard_collide_dist*Math.sin(theta + l.dir),
      );
      col_points.push(l.pos.clone().add(rot));
    }
    return col_points;
  }

  draw_col_points(pts) {
    let radius = 0.0015;
    pts.forEach(p => {
      ctx_lizard.beginPath();
      ctx_lizard.arc(p.x, p.y, radius, 0, 2*Math.PI);
      ctx_lizard.fillStyle = 'white'
      ctx_lizard.fill();
      ctx_lizard.closePath();
    })
  }
}

exports.GameRenderer = GameRenderer;
