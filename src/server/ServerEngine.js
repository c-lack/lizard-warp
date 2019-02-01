// ServerEngine.js
let GameEngine = require('../common/GameEngine.js').GameEngine;

let config = require('../common/config.json');

let random_color = require('../common/utils.js').random_color;
let random_pos = require('../common/utils.js').random_pos;

let GoogleSpreadsheet = require('google-spreadsheet');
let creds = require('./secret.json');

// Create a document object using the ID of the spreadsheet - obtained from its URL.
let doc = new GoogleSpreadsheet('1ZEL1XOaabYRljppBQkKGGyS-PynT_qfnmeuR8FoGKlM');

let game_points = 0;

module.exports = class ServerEngine {
  constructor() {
    this.queue = [];
    this.countdown_timer = null;
    this.gameengine = null;
    this.game_timer = false;
    this.trail_timer = false;
    this.broadcast_timer = false;
    this.end_game_timer = false;
    this.countdown_timer = false;
    this.results = [];
  }

  add_client(client) {
    this.register_events(client);
    this.queue.push({
      client: client,
      username: '',
      color: random_color(),
      points: 0,
    });
    this.broadcast_queue();
    if (this.game_timer) {
      client.emit('game_running');
    }
  }

  remove_client(client) {
    this.queue = this.queue.filter(c => {
      return c.client.id !== client.id;
    });
    this.broadcast_queue();
  }

  get_client(client) {
    return this.queue.filter(c => c.client.id === client.id)[0];
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
    });
    client.on('turn_left', () => {
      this.turn(client,-1);
    });
    client.on('turn_right', () => {
      this.turn(client,1);
    });
    client.on('turn_straight', () => {
      this.turn(client,0);
    });
    client.on('death', () => {
      this.kill_lizard(client);
    });
  }

  register_username(client, username) {
    if (this.get_client(client).username !== '') {
      client.emit('has_name');
      return;
    }
    else if (this.queue.map(c => c.username).includes(username)) {
      client.emit('name_exists');
      return;
    }
    else {
      this.get_client(client).username=username;
      this.get_client(client).color = random_color();
      this.broadcast_queue();
      client.emit('username_success');
      return;
    }
  }

  broadcast_queue() {
    this.queue.forEach(c => {
      c.client.emit('queue_update', JSON.stringify(
        this.queue.map(c => {
          return {username: c.username, color: c.color, points: c.points}
        })
      ));
    });
  }

  start_countdown() {
    if (this.countdown_timer) {
      console.log('double tap');
    } else {
      let countdown_val = config.countdown_max;
      this.countdown_timer = setInterval(() => {
        this.broadcast_countdown(countdown_val--);
        if (countdown_val < 0) {
          clearInterval(this.countdown_timer);
          this.countdown_timer = false;
          this.start_game();
        }
      },1000);
    }
  }

  broadcast_countdown(val) {
    this.queue.forEach(c => {
      c.client.emit('countdown', JSON.stringify(val));
    });
  }

  cancel_countdown() {
    clearInterval(this.countdown_timer);
    this.countdown_timer = false;
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
    game_points = 0;
    this.queue.forEach(p => {
      if (p.username !== '') {
        this.gameengine.add_player({
          id: p.client.id,
          username: p.username,
          color: p.color,
          pos: random_pos(),
          dir: Math.random()*Math.PI,
          health: true,
          speed: 0,
          turn_speed: config.turn_speed,
          turn: 0,
          trail: false,
        });
      }
    });
  }

  turn(c,dir) {
    this.gameengine.players.forEach(p => {
      if (p.id === c.id) {
        p.turn = dir;
      }
    });
  }

  break_trail() {
    let rand_l = this.gameengine.players[Math.floor(
      Math.random()*this.gameengine.players.length)];
    if (rand_l.trail) {
      rand_l.trail = false;
      setTimeout(() => {
        rand_l.trail = true;
      },config.trail_break_length);
    }
  }

  run_game() {
    this.broadcast_start_game();
    this.game_timer = setInterval(() => {
      this.gameengine.step();
    },config.game_update_rate);
    this.trail_timer = setInterval(() => {
      if (Math.random() < this.gameengine.players.length*config.trail_break_chance) {
        this.break_trail();
      }
    },config.game_trail_break_rate);
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
    },config.game_broadcast_rate);
    this.end_game_timer = setInterval(() => {
      this.check_end_game();
    },config.game_end_check_rate);
  }

  check_end_game() {
    let player_count = 0;
    this.gameengine.players.forEach(p => {
      if (p.health) {
        player_count++
      }
    });
    if (player_count < 2) {
      this.end_game();
    }
  }

  end_game() {
    this.gameengine.players.forEach(p => {
      if (p.health) {
        this.queue.forEach(c => {
          if (p.id === c.client.id) {
            c.points += this.gameengine.players.length - 1;
            if (!this.results.includes(c.username)) {
              this.results.push(c.username)
            }
            this.store_results(this.results);
            this.results = [];
            this.broadcast_queue();
            game_points = 0;
          }
        });
      }
    });
    this.broadcast_end_game();
    clearInterval(this.game_timer);
    clearInterval(this.trail_timer);
    clearInterval(this.broadcast_timer);
    clearInterval(this.end_game_timer);
    this.game_timer = false;
    this.trail_timer = false;
    this.broadcast_timer = false;
    this.end_game_timer = false;
  }

  broadcast_end_game() {
    this.queue.forEach(c => {
      c.client.emit('end_game');
    })
  }

  kill_lizard(c) {
    this.gameengine.players.forEach(p => {
      if (p.id === c.id) {
        p.kill();
      }
    });
    this.queue.forEach(p => {
      if (p.client.id === c.id) {
        p.points += game_points;
        if (!this.results.includes(p.username)) {
          this.results.push(p.username)
        }
        this.broadcast_queue();
        game_points++;
      }
    });
  }

  store_results(res) {
    let obj = new Object();
    for (let i = 0; i < res.length; i++) {
      let key = (i+10).toString(36);
      obj[key]=res[i];
    }

    doc.useServiceAccountAuth(creds, (err) => {
      doc.addRow(1, obj, (err) => {
        if (err) {
          throw err;
        }
      });
    });
  }
}
