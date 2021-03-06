// Lizard.js

let Victor = require('victor');

class Lizard {
  constructor(props) {
    this.id = props.id;
    this.username = props.username;
    this.pos = props.pos;
    this.prev_pos = false;
    this.dir = props.dir;
    this.health = props.health;
    this.color = props.color;
    this.speed = props.speed;
    this.turn_speed = props.turn_speed;
    this.turn = props.turn;
    this.trail = props.trail;
  }

  sync_to(props) {
    this.pos = new Victor(props.pos.x, props.pos.y);
    this.prev_pos = props.prev_pos ? new Victor(props.prev_pos.x,props.prev_pos.y) : false;
    if (props.prev_pos) {
      this.prev_pos = [];
      this.prev_pos = props.prev_pos.map(p => new Victor(p.x, p.y));
    } else {
      this.prev_pos = false;
    }
    this.dir = props.dir;
    this.health = props.health;
    this.speed = props.speed;
    this.trail = props.trail;
  }

  kill() {
    this.speed = 0;
    this.health = false;
  }
}

exports.Lizard = Lizard;
