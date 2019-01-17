import BaseTypes from 'lance/serialize/BaseTypes';
import DynamicObject from 'lance/serialize/DynamicObject';

export default class Trails extends DynamicObject {

  static get netScheme() {
    return Object.assign({
      trails: {
        type: BaseTypes.TYPES.LIST,
        itemType: BaseTypes.TYPES.CLASSINSTANCE
      }
    }, super.netScheme);
  }

  constructor(gameEngine, options, props) {
    super(gameEngine, options, props);
    this.class = Trails;
    this.trails = [];
  }

  syncTo(other) {
    super.syncTo(other);
    this.trails = other.trails;
  }

  add(pos) {
    this.trails.push(pos);
  }
}
