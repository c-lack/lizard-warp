import React from 'react';

export default class Username extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
    }
  }

  handleChange(e) {
    this.setState({username: e.target.value});
  }

  submit() {
    if (this.state.username === '') {
      alert('Can\'t submit empty name');
      return;
    }
    this.props.sendUsername(this.state.username);
  }

  render() {
    return (
      <div>
        <input type="text" value={this.state.username} onChange={this.handleChange.bind(this)} />
        <button onClick={this.submit.bind(this)}>Ok</button>
      </div>
    )
  }
}
