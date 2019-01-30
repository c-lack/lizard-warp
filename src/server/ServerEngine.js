// ServerEngine.js
var GameEngine = require('../common/GameEngine.js').GameEngine;

var random_color = require('../common/utils.js').random_color;
var random_pos = require('../common/utils.js').random_pos;

module.exports = class ServerEngine {
  constructor() {
    this.clients = [];
    this.queue = [];
    this.countdown_timer = null;
    this.gameengine = null;
    this.game_timer = null;
    this.broadcast_timer = null;
  }

  add_client(client) {
    this.register_events(client);
    this.clients.push({
      client: client,
      username: '',
    });
    this.broadcast_queue();
  }

  remove_client(client) {
    this.clients = this.clients.filter(c => {
      return c.client.id !== client.id;
    });
    this.queue = this.queue.filter(c => {
      return c.client.id !== client.id;
    });
    this.broadcast_queue();
  }

  get_client(client) {
    return this.clients.filter(c => c.client.id === client.id)[0];
  }

  register_events(client) {
    client.on('username', (username) => {
      this.register_username(client,username)
    });
    client.on('start_countdown', () => {
      this.start_countdown();
    });
    client.on('cancel_countdown', () => {
      this.cancel_countdown();
    })
    client.on('turn_left', () => {
      this.turn(client,-1);
    });
    client.on('turn_right', () => {
      this.turn(client,1);
    });
    client.on('turn_straight', () => {
      this.turn(client,0);
    });
  }

  register_username(client, username) {
    if (this.get_client(client).username !== '') {
      client.emit('has_name');
      return;
    }
    else if (this.clients.map(c => c.username).includes(username)) {
      client.emit('name_exists');
      return;
    }
    else {
      this.get_client(client).username=username;
      this.get_client(client).color = random_color();
      this.queue.push(this.get_client(client));
      this.broadcast_queue();
      client.emit('username_success');
      return;
    }
  }

  broadcast_queue() {
    this.clients.forEach(c => {
      c.client.emit('queue_update', JSON.stringify(
        this.queue.map(c => {
          return {username: c.username, color: c.color}
        })
      ));
    });
  }

  start_countdown() {
    var countdown_val = 1; // TODO change back to 5
    this.countdown_timer = setInterval(() => {
      this.broadcast_countdown(countdown_val--);
      if (countdown_val < 0) {
        clearInterval(this.countdown_timer);
        this.start_game();
      }
    },1000);
  }

  broadcast_countdown(val) {
    this.queue.forEach(c => {
      c.client.emit('countdown', JSON.stringify(val));
    });
  }

  cancel_countdown() {
    clearInterval(this.countdown_timer);
    this.countdown_timer = null;
    this.broadcast_countdown_cancel();
  }

  broadcast_countdown_cancel() {
    this.queue.forEach(c => {
      c.client.emit('cancel_countdown');
    });
  }

  broadcast_start_game() {
    this.queue.forEach(c => {
      c.client.emit('start_game');
    });
  }

  start_game() {
    this.gameengine = new GameEngine();
    this.initialise_game();
    this.run_game();
  }

  initialise_game() {
    this.queue.forEach(p => {
      this.gameengine.add_player({
        id: p.client.id,
        username: p.username,
        color: p.color,
        pos: random_pos(),
        dir: Math.random()*Math.PI,
        health: 1,
        speed: 0.001,
        turn_speed: 0.02,
        turn: 0
      })
    })
  }

  turn(c,dir) {
    this.gameengine.players.forEach(p => {
      if (p.id === c.id) {
        p.turn = dir;
      }
    });
  }

  run_game() {
    this.broadcast_start_game();
    this.game_timer = setInterval(() => {
      this.gameengine.step();
    },17);
    this.broadcast_timer = setInterval(() => {
      this.queue.forEach(p => {
        p.client.emit('game_state', JSON.stringify({
          players: this.gameengine.players,
          walls_temp: this.gameengine.walls_temp,
        }));
      });
      this.gameengine.walls_temp = [];
      this.gameengine.walls_fixed = this.gameengine
        .walls_fixed.concat(this.gameengine.walls_temp);
    },102);
  }

}
