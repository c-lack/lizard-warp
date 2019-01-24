import React, { Component } from 'react';

export default class UserName extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: ''
    }
  }

  handleChange(e) {
    this.setState({
      username: e.target.value,
    });
  }

  submit() {
    this.props.submit(this.state.username);
  }

  render() {
    return (
      <div className="username">
        <input
          type="text"
          value={this.state.username}
          onChange={this.handleChange.bind(this)}
        />
        <button
          onClick={this.submit.bind(this)}
        > Ok </button>
      </div>
    )
  }
}
