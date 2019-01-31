// Lizard.js

let Victor = require('victor');

class Lizard {
  constructor(props) {
    this.id = props.id;
    this.username = props.username;
    this.pos = props.pos;
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
    this.dir = props.dir;
  }

  kill() {
    this.speed = 0;
    this.health = false;
  }
}

exports.Lizard = Lizard;
