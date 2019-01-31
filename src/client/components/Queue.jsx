import React, { Component } from 'react';

export default class Queue extends Component {
  render() {
    return (
      <div className="queue">
        <ul>
          {this.props.queue.map( (p) => {
            if (p.username !== '') {
              return (
                <li
                  key={p.username}
                  style={{color: p.color.code}}
                >{p.username}</li>
              )
            }
          })}
        </ul>
      </div>
    )
  }
}
