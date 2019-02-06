import React, { Component } from 'react';

export default class Leaderboard extends Component {
  constructor() {
    super();
    this.state = {
      show: false,
    }
  }
  render() {
    return (
      <div className="leaderboard">
        <button onClick={() => this.setState({show: !this.state.show})}>
          Show leaderboard
        </button>
        {this.state.show ?
          <div>
            {this.props.leaderboard ? this.props.leaderboard.map(player => {
              return (<li key={player.name}>{player.name} {player.rank*1000 + 3000}</li>)
            }) : <div></div>}
          </div> :
          <div></div>
        }
      </div>
    );
  }
}
