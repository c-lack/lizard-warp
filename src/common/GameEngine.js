// GameEngine.js
var Lizard = require('../common/Lizard.js').Lizard;

var random_color = require('../common/utils.js').random_color;
var random_pos = require('../common/utils.js').random_pos;

class GameEngine {
  constructor(players) {
    this.players = players;
    this.walls_temp = [];
    this.walls_fixed = [];

    this.assign_lizards();
  }

  assign_lizards() {
    this.players.forEach(p => {
      p.lizard = new Lizard({
        pos: random_pos(),
        dir: Math.random()*Math.PI,
        health: 1,
        color: random_color(),
        speed: 0,
      });
    });
  }

  step() {

  }

}

exports.GameEngine = GameEngine;
