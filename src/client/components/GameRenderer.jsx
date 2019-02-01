import React, { Component } from 'react';

let Renderer = require('../../common/GameRenderer.js').GameRenderer;

let config = require('../../common/config.json');

export default class GameRenderer extends Component {
  constructor(props) {
    super(props);
    this.renderer = new Renderer(props.engine.game);
    setInterval(() => {
      this.renderer.draw()
    },config.game_update_rate);
  }

  render() {
    this.renderer.draw();
    return (
      <div></div>
    )
  }
}
