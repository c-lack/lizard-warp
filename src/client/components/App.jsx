import React, { Component } from 'react';
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:3000');

import UserName from './Username.jsx';

class App extends Component {
  submitUserName(username) {
    socket.emit('username',username);
  }

  render() {
    return (
      <div className="app">
        <UserName submit={this.submitUserName.bind(this)}/>
      </div>
    )
  }
}

export default App;
