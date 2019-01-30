// Lizard.js

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
  }
}

exports.Lizard = Lizard;
