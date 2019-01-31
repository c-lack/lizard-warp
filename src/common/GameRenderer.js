// GameRenderer.js

let ctx = null;
let canvas = null;
let game = null;

class GameRenderer {
  constructor(g) {
    game = g;
    canvas = document.createElement('canvas');
    canvas.width = Math.min(window.innerWidth,window.innerHeight);
    canvas.height = Math.min(window.innerWidth,window.innerHeight);
    document.body.insertBefore(canvas, document.getElementById('root'));
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.01;
  }

  draw() {
    // Clear the canvas
    // ctx.clearRect(0,0,canvas.width, canvas.height);

    // Translate to center
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(canvas.width,canvas.height);

    // Draw all lizards
    game.players.forEach(l => {
      if (this.get_color(l.pos.x,l.pos.y)) {
        game.kill_lizard(l);
      }
      if (l.health && l.trail) {
        this.draw_lizard(l);
      }
    });

    // draw bounds
    this.draw_bounds();

    // restore canvas
    ctx.restore();
  }

  draw_lizard(l) {
    ctx.save();
    ctx.translate(l.pos.x,l.pos.y);
    ctx.rotate(l.dir + Math.PI/2);
    ctx.beginPath();
    ctx.arc(0,0,0.005,0,Math.PI);
    ctx.fillStyle = l.color.code;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  draw_wall(w) {
    ctx.beginPath();
    ctx.arc(w.pos.x,w.pos.y,0.5,0,2*Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  draw_bounds() {
    ctx.beginPath();
    ctx.moveTo(-0.5, -0.5);
    ctx.lineTo(-0.5, 0.5);
    ctx.lineTo( 0.5, 0.5);
    ctx.lineTo( 0.5, -0.5);
    ctx.lineTo(-0.5, -0.5);
    ctx.stroke();
    ctx.closePath();
  }

  get_color(x,y) {
    let X = canvas.width*(x+0.5);
    let Y = canvas.height*(y+0.5);
    let dat = ctx.getImageData(X-2,Y-2,5,5).data;
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
