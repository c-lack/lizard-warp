// ClientEngine.js

class ClientEngine {
  constructor() {
    this.lizards = [];
    this.walls_temp = [];
    this.walls_fixed = [];
  }

  update_state(props) {
    console.log('update');
    this.lizards = props.lizards;
    this.walls_fixed.push(...props.wall_temp);
  }

}

exports.ClientEngine = ClientEngine;
