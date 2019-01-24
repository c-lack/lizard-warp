import React, { Component } from 'react';
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:3000');

class App extends Component {
  render() {
    return <h1>Lizard warp</h1>;
  }
}

export default App;
