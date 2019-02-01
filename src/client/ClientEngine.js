// ClientEngine.js

var GameEngine = require('../common/GameEngine.js').GameEngine;

let Victor = require('victor');

let config = require('../common/config.json');

class ClientEngine {
  constructor(socket) {
    this.socket = socket;
    this.game = new GameEngine();
    this.alive = true;
    this.register_events(socket);
    this.run_game();
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
      this.initial_state(JSON.parse(json));
      socket.off('game_state');
      socket.on('game_state', (json) => {
        this.update_state(JSON.parse(json));
      });
    });
  }

  run_game() {
    this.game_timer = setInterval(() => {
      this.game.step()
      this.check_deaths();
    },config.game_update_rate);
  }

  end_game() {
    clearInterval(this.game_timer);
  }

  check_deaths() {
    if (this.alive) {
      this.game.players.forEach(p => {
        if (p.id === this.socket.id) {
          if (!p.health) {
            this.socket.emit('death');
            this.alive = false;
          }
        }
      });
    }
  }

  initial_state(props) {
    // this.game.players = props.players.map(p => {
    //   p.pos = new Victor(p.pos.x, p.pos.y);
    //   return p;
    // });
    props.players.forEach(p => {
      this.game.add_player({
        id: p.id,
        username: p.username,
        color: p.color,
        pos: new Victor(p.pos.x, p.pos.y),
        dir: p.dir,
        health: p.health,
        speed: p.speed,
        turn_speed: p.turn_speed,
        turn: p.turn
      });
    });

  }

  update_state(props) {
    this.game.players.forEach(p => {
      props.players.forEach(sp => {
        if (p.id === sp.id) {
          p.sync_to(sp);
        }
      });
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

  kill_lizard() {

  }
}

exports.ClientEngine = ClientEngine;
