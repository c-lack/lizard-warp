// ClientEngine.js

let GameEngine = require('../common/GameEngine.js').GameEngine;
let BotRandom = require('./bots/BotRandom.js').BotRandom;
let BotAvoid = require('./bots/BotAvoid.js').BotAvoid;
let BotChris = require('./bots/BotChris.js').BotChris;
let BotAlvaro = require('./bots/BotAlvaro.js').BotAlvaro;
let BotSon = require('./bots/BotSon.js').BotSon;
let BotAlex = require('./bots/BotAlex.js').BotAlex;
let BotConnor = require('./bots/BotConnor.js').BotConnor;
let BotMoh = require('./bots/BotMoh.js').BotMoh;
let BotTrent = require('./bots/BotTrent.js').BotTrent;

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
      this.game.step();
      this.check_deaths();
    },config.game_update_rate);
  }

  end_game() {
    clearInterval(this.game_timer);
    if (this.bot) {
      this.bot.disable_interval();
    }
    location.reload();
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
    // Check if this client is a bot
    props.players.forEach(p => {
      if (p.id === this.socket.id) {
        if (p.username.substring(0,4) === 'bot_') {
          switch(p.username.substring(4,p.username.length)) {
            case 'random':
              // Register this client as a random bot
              this.bot = new BotRandom(
                this.game,
                this.turn_left.bind(this),
                this.turn_right.bind(this),
                this.turn_straight.bind(this)
              )
              break;
            case 'avoid':
              // Register this client as a random bot
              this.bot = new BotAvoid(
                this.game,
                this.turn_left.bind(this),
                this.turn_right.bind(this),
                this.turn_straight.bind(this)
              )
              break;
            case 'chris':
              // Register this client as a random bot
              this.bot = new BotChris(
                this.game,
                this.turn_left.bind(this),
                this.turn_right.bind(this),
                this.turn_straight.bind(this)
              )
              break;
            case 'alvaro':
              // Register this client as a random bot
              this.bot = new BotAlvaro(
                this.game,
                this.turn_left.bind(this),
                this.turn_right.bind(this),
                this.turn_straight.bind(this)
              )
              break;
            case 'son':
              // Register this client as a random bot
              this.bot = new BotSon(
                this.game,
                this.turn_left.bind(this),
                this.turn_right.bind(this),
                this.turn_straight.bind(this)
              )
              break;
            case 'alex':
              // Register this client as a random bot
              this.bot = new BotAlex(
                this.game,
                this.turn_left.bind(this),
                this.turn_right.bind(this),
                this.turn_straight.bind(this)
              )
              break;
            case 'moh':
              // Register this client as a random bot
              this.bot = new BotMoh(
                this.game,
                this.turn_left.bind(this),
                this.turn_right.bind(this),
                this.turn_straight.bind(this)
              )
              break;
            case 'trent':
              // Register this client as a random bot
              this.bot = new BotTrent(
                this.game,
                this.turn_left.bind(this),
                this.turn_right.bind(this),
                this.turn_straight.bind(this)
              )
              break;
            case 'connor':
              // Register this client as a random bot
              this.bot = new BotConnor(
                this.game,
                this.turn_left.bind(this),
                this.turn_right.bind(this),
                this.turn_straight.bind(this)
              )
              break;
            default:
              break;
          }
        }
      }
    })
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
}

exports.ClientEngine = ClientEngine;
