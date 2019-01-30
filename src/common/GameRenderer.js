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
    document.body.insertBefore(canvas, document.getElementById('bot'));
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.01;
  }

  draw() {
    // Clear the canvas
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // Translate to center
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(canvas.width,canvas.height);

    // Draw all lizards
    game.players.forEach(l => {
        this.draw_lizard(l);
    });

    // Draw all walls
    // state.walls_temp.forEach(w => {
    //     this.draw_wall(w);
    // });
    // state.walls_fixed.forEach(w => {
    //     this.draw_wall(w);
    // });

    // draw bounds
    this.draw_bounds();

    // restore canvas
    ctx.restore();
  }

  draw_lizard(l) {
    ctx.beginPath();
    ctx.arc(l.pos.x,l.pos.y,0.01,0,2*Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  draw_wall(w) {
    ctx.beginPath();
    ctx.arc(w.pos.x,w.pos.y,5,0,2*Math.PI);
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
}

exports.GameRenderer = GameRenderer;
