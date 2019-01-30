import React, { Component } from 'react';

let Renderer = require('../../common/GameRenderer.js').GameRenderer;

export default class GameRenderer extends Component {
  constructor(props) {
    super(props);
    this.renderer = new Renderer(props.engine.game);
    setInterval(() => {
      this.renderer.draw()
    },17);
  }

  render() {
    this.renderer.draw();
    return (
      <div></div>
    )
  }
}
