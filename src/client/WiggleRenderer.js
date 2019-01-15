import Renderer from 'lance/render/Renderer';
import TwoVector from 'lance/serialize/TwoVector';
import Wiggle from '../common/Wiggle';

let ctx = null;
let canvas = null;
let game = null;
let c = 0;

var lizardImage = new Image();
lizardImage.src = "/sprites/lizard.png";

var shift = 0;
var frameWidth = 150;
var frameHeight = 150;
var totalFrames = 4;
var currentFrame = 0;
var frameCount = 0;

export default class WiggleRenderer extends Renderer {

    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        game = gameEngine;
        canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.insertBefore(canvas, document.getElementById('logo'));
        game.w = canvas.width;
        game.h = canvas.height;
        clientEngine.zoom = game.h / game.spaceHeight;
        if (game.w / game.spaceWidth < clientEngine.zoom) clientEngine.zoom = game.w / game.spaceWidth;
        ctx = canvas.getContext('2d');
        ctx.lineWidth = 2 / clientEngine.zoom;
        ctx.strokeStyle = ctx.fillStyle = 'white';
    }

    draw(t, dt) {
        super.draw(t, dt);

        // Clear the canvas
        ctx.clearRect(0, 0, game.w, game.h);

        // Transform the canvas
        // Note that we need to flip the y axis since Canvas pixel coordinates
        // goes from top to bottom, while physics does the opposite.
        ctx.save();
        ctx.translate(game.w/2, game.h/2); // Translate to the center
        ctx.scale(this.clientEngine.zoom, this.clientEngine.zoom);  // Zoom in and flip y axis

        // Draw all lizards
        game.world.forEachObject((id, obj) => {
            if (obj instanceof Wiggle) {
              this.drawWiggle(obj);
            }
        });

        // Draw bounds
        this.drawBounds();

        ctx.restore();

    }

    drawWiggle(w) {

        // draw head and body
        let isPlayer = w.playerId === this.gameEngine.playerId;
        let x = w.position.x;
        let y = w.position.y;
        // this.drawCircle(x, y, 0.7*w.headRadius/2, false);
        this.drawTrail(w);
        this.drawLizard(x,y,w.headRadius,w.direction);
    }

    drawCircle(x, y, radius, fill) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2*Math.PI);
        fill?ctx.fill():ctx.stroke();
        ctx.closePath();
    }

    drawLizard(x,y,radius,dir) {
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(dir + Math.PI/2);
      ctx.drawImage(lizardImage, shift, 0, frameWidth, frameHeight,
                    -0.5*radius,-0.5*radius, radius, radius);
      ctx.restore();

      // Calculations for animation speed
      // TODO: Change 16 to be dependent on speed
      if (frameCount < 16) {
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

    drawTrail(w) {
      w.trail.map(p => {
        this.drawCircle(p.x,p.y,w.headRadius/10,true);
      })
    }

    drawBounds() {
        ctx.beginPath();
        ctx.moveTo(-game.spaceWidth/2, -game.spaceHeight/2);
        ctx.lineTo(-game.spaceWidth/2, game.spaceHeight/2);
        ctx.lineTo( game.spaceWidth/2, game.spaceHeight/2);
        ctx.lineTo( game.spaceWidth/2, -game.spaceHeight/2);
        ctx.lineTo(-game.spaceWidth/2, -game.spaceHeight/2);
        ctx.stroke();
        ctx.closePath();
    }

}
