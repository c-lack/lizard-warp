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
    this.collision_detection();
    this.players.forEach(p => {
      let move = new Victor(
        Math.cos(p.dir),
        Math.sin(p.dir),
      );
      let scale = new Victor(p.speed,p.speed);
      p.pos.add(move.multiply(scale));
      if (p.pos.x < -0.5 || p.pos.x > 0.5 || p.pos.y < -0.5 || p.pos.y > 0.5) {
        this.kill_lizard(p);
      }
      p.pos.x = Math.max(p.pos.x,-0.5);
      p.pos.x = Math.min(p.pos.x,0.5);
      p.pos.y = Math.max(p.pos.y,-0.5);
      p.pos.y = Math.min(p.pos.y,0.5);
      p.dir += p.turn*p.turn_speed;
    })
  }

  collision_detection() {
    this.players.forEach(p1 => {
      this.players.forEach(p2 => {
        if (p1.id === p2.id) {
          return;
        }
        if (p1.pos.clone().subtract(p2.pos).length() < 0.015) {
          if (Math.random() < 0.5) {
            this.kill_lizard(p1);
            this.kill_lizard(p2);
          } else {
            this.kill_lizard(p2);
            this.kill_lizard(p1);
          }
        }
      });
    });
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
