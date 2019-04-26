// GameEngine.js
let Lizard = require('./Lizard.js').Lizard;

let Victor = require('victor');

let config = require('./config.json');

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
    },config.trail_delay);
    setTimeout(() => {
      _this.players.forEach(p => {
        p.speed = 0.002;
      });
    },config.move_delay);
  }

  add_player(props) {
    this.players.push(new Lizard(props));
  }

  step() {
    this.collision_detection();
    this.players.forEach(p => {
      if (p.trail) {
        if (!p.prev_pos) {
          p.prev_pos = [];
        }
        p.prev_pos.push(p.pos.clone());
        while (p.prev_pos.length > config.trail_render_length) {
          p.prev_pos.shift();
        }
      } else {
        p.prev_pos = false;
      }
      let move = new Victor(
        Math.cos(p.dir),
        Math.sin(p.dir),
      );
      let scale = new Victor(p.speed,p.speed);
      p.pos.add(move.multiply(scale));
      if (p.pos.x < config.min_board
          || p.pos.x > config.max_board
          || p.pos.y < config.min_board
          || p.pos.y > config.max_board) {
        this.kill_lizard(p);
      }
      p.pos.x = Math.max(p.pos.x,config.min_board);
      p.pos.x = Math.min(p.pos.x,config.max_board);
      p.pos.y = Math.max(p.pos.y,config.min_board);
      p.pos.y = Math.min(p.pos.y,config.max_board);
      p.dir += p.turn*p.turn_speed;
    })
  }

  collision_detection() {
    this.players.forEach(p1 => {
      this.players.forEach(p2 => {
        if (p1.id === p2.id) {
          return;
        }
        if (p1.pos.clone().subtract(p2.pos).length() < config.lizard_collide_dist) {
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
