// ServerEngine.js
let GameEngine = require('../common/GameEngine.js').GameEngine;

let config = require('../common/config.json');

let random_color = require('../common/utils.js').random_color;
let random_pos = require('../common/utils.js').random_pos;
let zip = require('../common/utils.js').zip;

let GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util')

let creds = require('./secret.json');

let game_points = 0;

let beta = 0.05;
alpha = 0.1;

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
    this.recalculate_leaderboard();
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
            let tmp_results = this.results;
            save_game(tmp_results).then(() => {
              get_leaderboard().then(leaderboard => {
                save_leaderboard(update_leaderboard(leaderboard,tmp_results))
              });
            });
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

  recalculate_leaderboard() {
    get_games().then(games => {
      save_leaderboard(calc_new_leaderboard(games));
    });
  }

}

async function save_game(game) {
  const doc = new GoogleSpreadsheet('1ZEL1XOaabYRljppBQkKGGyS-PynT_qfnmeuR8FoGKlM');
  await promisify(doc.useServiceAccountAuth)(creds)
  const info = await promisify(doc.getInfo)()
  const sheet = info.worksheets[0];

  let game_obj = new Object();
  for (let i = 0; i < game.length; i++) {
    let key = (i+10).toString(36);
    game_obj[key]=game[i];
  }
  await promisify(doc.addRow)(1,game_obj);
}

async function get_games() {
  const doc = new GoogleSpreadsheet('1ZEL1XOaabYRljppBQkKGGyS-PynT_qfnmeuR8FoGKlM');
  await promisify(doc.useServiceAccountAuth)(creds)
  const info = await promisify(doc.getInfo)()
  const sheet = info.worksheets[0];

  let games = [];
  let players = [];
  let rows = await promisify(sheet.getRows)({
    offset: 1,
  });
  for (const row of rows) {
    let game = [];
    for (let i = 0; i < 16; i++) {
      let key = (i+10).toString(base=26);
      if (row[key] !== '') {
        game.push(row[key]);
        if (!players.includes(row[key])) {
          players.push(row[key]);
        }
      }
    }
    games.push(game);
  }
  return [players, games];
}

function calc_new_leaderboard(games) {
  let players = games[0];
  games = games[1];


  let scores = new Object();
  for (const plyr of players) {
    scores[plyr] = 0;
  }
  games.forEach(game => {
    let p = [];
    game.forEach(plyr => {
      p.push(scores[plyr]);
    });
    let d = rank(p);
    zip(game,d).forEach(tuple => {
      scores[tuple[0]] = scores[tuple[0]] + tuple[1];
    });
  })
  let leaderboard = [];
  players.forEach(plyr => {
    leaderboard.push({
      name: plyr,
      rank: scores[plyr]
    })
  });
  return leaderboard.sort((a,b) => b.rank - a.rank);
}

function update_leaderboard(leaderboard, game) {
  let p = [];
  console.log(leaderboard);
  game.forEach(plyr => {
    if (leaderboard.map(x => x.name).includes(plyr)) {
      console.log(plyr);
      p.push(leaderboard.find(x => {
        return x.name === plyr;
      }).rank);
    } else {
      p.push(0);
      leaderboard.push({
        name: plyr,
        rank: 0,
      });
    }
  });
  console.log(leaderboard,p);
  let d = rank(p);
  zip(game,d).forEach(updt => {
    leaderboard.find(x => x.name === updt[0]).rank += updt[1];
  });
  return leaderboard.sort((a,b) => b.rank - a.rank);
}

async function save_leaderboard(leaderboard) {
  const doc = new GoogleSpreadsheet('1ZEL1XOaabYRljppBQkKGGyS-PynT_qfnmeuR8FoGKlM');
  await promisify(doc.useServiceAccountAuth)(creds)
  const info = await promisify(doc.getInfo)()
  const sheet = info.worksheets[1];
  const cells = await promisify(sheet.getCells)({
    'min-row': 1,
    'max-row': 1000,
    'min-col': 1,
    'max-col': 2,
    'return-empty': true,
  })
  for (const cell of cells) {
      if (cell.row < 2) {
        continue;
      } else {
        cell.value = '';
        if (cell.row - 2 < leaderboard.length) {
          if (cell.col < 2) {
            cell.value = leaderboard[cell.row-2].name
          } else {
            cell.value = (Math.trunc(leaderboard[cell.row-2].rank*1000 + 3000)).toString();
          }
        }
      }
  }
  await promisify(sheet.bulkUpdateCells)(cells);
}

async function get_leaderboard() {
  const doc = new GoogleSpreadsheet('1ZEL1XOaabYRljppBQkKGGyS-PynT_qfnmeuR8FoGKlM');
  await promisify(doc.useServiceAccountAuth)(creds)
  const info = await promisify(doc.getInfo)()
  const sheet = info.worksheets[1];
  let rows = await promisify(sheet.getRows)({
    offset: 1,
  });
  let leaderboard = [];
  for (const row of rows) {
    leaderboard.push({
      name: row.name,
      rank: (row.rank-3000)/1000,
    });
  }
  return leaderboard;
}

function rank(arr) {
  if (arr.length === 2) {
    return rank_2(arr[0],arr[1]);
  } else {
    let d = rank(arr.slice(0,-1));
    d.push(0);
    for (let i = 0; i < d.length - 1; i++) {
      d[i] = d[i] + rank_2(arr[i], arr[arr.length-1])[0];
      d[d.length-1] = d[d.length-1] - rank_2(arr[i],arr[arr.length-1])[0];
    }
    return d;
  }
}

function rank_2(p1,p2) {
  let d1 = Math.min(beta,alpha*Math.exp(p2-p1));
  let d2 = -d1;
  return [d1,d2];
}
