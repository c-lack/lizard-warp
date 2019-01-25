import React, { Component } from 'react';

export default class Queue extends Component {
  render() {
    return (
      <div className="queue">
        <ul>
          {this.props.queue.map( (username) => (
            <li key={username}>{username}</li>
          ))}
        </ul>
      </div>
    )
  }
}
