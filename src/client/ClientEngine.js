// ClientEngine.js

var GameEngine = require('../common/GameEngine.js').GameEngine;

let Victor = require('victor');

class ClientEngine {
  constructor(socket) {
    this.socket = socket;
    this.game = new GameEngine();
    this.register_events(socket);
    setInterval(() => {
      this.game.step()
    },17);
    let _this = this;
    document.addEventListener('keydown', function(event) {
      switch (event.keyCode) {
        case 65: // A
          _this.turn_left();
          break;
        case 37: // left
          _this.turn_left();
          break;
        case 68: // D
          _this.turn_right();
          break;
        case 39: // right
          _this.turn_right();
          break;
      }
    });
    document.addEventListener('keyup', function(event) {
      switch (event.keyCode) {
        case 65: // A
          _this.turn_straight();
          break;
        case 37: // left
          _this.turn_straight();
          break;
        case 68: // D
          _this.turn_straight();
          break;
        case 39: // right
          _this.turn_straight();
          break;
      }
    });
  }

  register_events(socket) {
    socket.on('game_state', (json) => {
      this.update_state(JSON.parse(json));
    });
  }

  update_state(props) {
    this.game.players = props.players.map(p => {
      p.pos = new Victor(p.pos.x, p.pos.y);
      return p;
    });
    this.game.walls_temp = [];
    this.game.walls_fixed = this.game.walls_fixed.concat(props.walls_temp);
  }

  turn_left() {
    this.game.players.forEach((p) => {
      if (this.socket.id === p.id) {
        p.turn = -1;
      }
    });
    this.socket.emit('turn_left')
  }

  turn_right() {
    this.game.players.forEach((p) => {
      if (this.socket.id === p.id) {
        p.turn = 1;
      }
    });
    this.socket.emit('turn_right')
  }

  turn_straight() {
    this.game.players.forEach((p) => {
      if (this.socket.id === p.id) {
        p.turn = 0;
      }
    });
    this.socket.emit('turn_straight')
  }
}

exports.ClientEngine = ClientEngine;
