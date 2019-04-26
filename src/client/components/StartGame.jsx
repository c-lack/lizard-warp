import React, { Component } from 'react';

export default class StartGame extends Component {
  render() {
    return (
      <div className="start-btn">
        <button
          onClick={this.props.start}
        >{this.props.on ? 'Cancel' : 'Start game'}</button>
      </div>
    );
  }
}
