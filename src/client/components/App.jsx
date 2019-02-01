import React, { Component } from 'react';
import openSocket from 'socket.io-client';
const socket = openSocket();

import UserName from './Username.jsx';
import Queue from './Queue.jsx';
import StartGame from './StartGame.jsx';
import Countdown from './Countdown.jsx';
import GameRenderer from './GameRenderer.jsx';

var ClientEngine = require('../ClientEngine.js').ClientEngine;

class App extends Component {
  constructor() {
    super();
    this.state = {
      username_set: false,
      queue: false,
      game_btn: false,
      countdown: false,
      countdown_val: 5,
      game: false,
      clientengine: null,
    };
  }

  componentDidMount() {
    this.register_events(socket);
  }

  register_events(socket) {
    // Submitting username
    socket.on('has_name', () => {
      alert('You already have a username.');
    });
    socket.on('name_exists', () => {
      alert('This username is taken.')
    });
    socket.on('username_success', () => {
      this.setState({username_set: true, game_btn: true});
    });
    // Receiving other usernames
    socket.on('queue_update', (queue_str) => {
      this.queueUpdate(queue_str);
    });
    // Starting game
    socket.on('countdown', (countdown_val) => {
      this.setState({
        countdown_val,
        countdown: true,
      });
    });
    socket.on('cancel_countdown', () => {
      this.setState({
        countdown_val: 5,
        countdown: false,
      });
    });
    socket.on('start_game', () => {
      this.startGame();
    });
    socket.on('end_game', () => {
      this.endGame();
    });
    socket.on('game_running', () => {
      this.setState({
        game_btn: false
      });
    });
  }

  submitUserName(username) {
    if (username === '') {
      alert('Username can\'t be blank.');
      return;
    }
    socket.emit('username',username);
  }

  queueUpdate(str) {
    let queue = JSON.parse(str);
    this.setState({queue: queue});
  }

  startCountdown() {
    if (this.state.countdown) {
      socket.emit('cancel_countdown');
    } else {
      socket.emit('start_countdown');
    }
  }

  startGame() {
    this.setState({
      game_btn: false,
      countdown: false,
      game: true,
      clientengine: new ClientEngine(socket),
    });
  }

  endGame() {
    let _this = this;
    setTimeout(() => {
      _this.state.clientengine.end_game();
      setTimeout(() => {
        _this.setState({
          game_btn: true,
          game: false,
        },() => {
          document.getElementsByTagName("canvas")[0].outerHTML = "";
          document.getElementsByTagName("canvas")[0].outerHTML = "";
        });
      },1000);
    },2000);
  }

  render() {
    return (
      <div className="app">
        {this.state.username_set
          ? <div></div>
          : <UserName submit={this.submitUserName.bind(this)} />}
        {this.state.queue
          ? <Queue queue={this.state.queue} />
          : <div></div>
        }
        {this.state.game_btn
          ? <StartGame on={this.state.countdown} start={this.startCountdown.bind(this)} />
          : <div></div>
        }
        {this.state.countdown
          ? <Countdown val={this.state.countdown_val} />
          : <div></div>
        }
        {this.state.game
          ? <GameRenderer engine={this.state.clientengine} />
          : <div></div>
        }
        <div>
          <audio id="theme_audio" src={"./music/theme.mp3"} controls autoPlay loop />
        </div>
      </div>
    )
  }
}

export default App;
