// ServerEngine.js
var GameEngine = require('../common/GameEngine.js').GameEngine;

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
      this.queue.push(this.get_client(client));
      this.broadcast_queue();
      client.emit('username_success');
      return;
    }
  }

  broadcast_queue() {
    this.clients.forEach(c => {
      c.client.emit('queue_update', JSON.stringify(
        this.queue.map(c => c.username)
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
    this.gameengine = new GameEngine(this.queue);
    this.run_game();
    this.broadcast_start_game();
  }

  run_game() {
    this.game_timer = setInterval(() => {
      this.gameengine.step();
    },1000);
    this.broadcast_timer = setInterval(() => {
      this.queue.forEach(p => {
        p.client.emit('game_state', JSON.stringify({
          lizards: this.gameengine.players.map(p => p.lizard),
          walls_temp: this.gameengine.walls_temp,
        }));
      });
    },3000);
  }

}