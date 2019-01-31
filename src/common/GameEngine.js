// GameEngine.js
let Lizard = require('../common/Lizard.js').Lizard;

let Victor = require('victor');

class GameEngine {
  constructor() {
    this.players = [];
    this.walls_temp = [];
    this.walls_fixed = [];
    let _this = this;
    setTimeout(() => {
      _this.players.forEach(p => {
        p.trail = true;
      });
    },3000);
    setTimeout(() => {
      _this.players.forEach(p => {
        p.speed = 0.002;
      });
    },1000);
  }

  add_player(props) {
    this.players.push(new Lizard(props));
  }

  step() {
    this.players.forEach(p => {
      let move = new Victor(
        Math.cos(p.dir),
        Math.sin(p.dir),
      );
      let scale = new Victor(p.speed,p.speed);
      p.pos.add(move.multiply(scale));
      p.pos.x = Math.max(p.pos.x,-0.5);
      p.pos.x = Math.min(p.pos.x,0.5);
      p.pos.y = Math.max(p.pos.y,-0.5);
      p.pos.y = Math.min(p.pos.y,0.5);
      p.dir += p.turn*p.turn_speed;
    })
  }

  kill_lizard(l) {
    this.players.forEach(p => {
      if (p.id === l.id) {
        p.kill();
      }
    });
  }

}

exports.GameEngine = GameEngine;
