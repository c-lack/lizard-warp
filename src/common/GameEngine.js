// GameEngine.js
let Lizard = require('../common/Lizard.js').Lizard;

let Victor = require('victor');

class GameEngine {
  constructor() {
    this.players = [];
    this.walls_temp = [];
    this.walls_fixed = [];
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
      p.dir += p.turn*p.turn_speed;
    })
  }

}

exports.GameEngine = GameEngine;
