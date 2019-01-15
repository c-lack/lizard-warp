import BaseTypes from 'lance/serialize/BaseTypes';
import DynamicObject from 'lance/serialize/DynamicObject';

export default class Wiggle extends DynamicObject {

    static get netScheme() {
        return Object.assign({
            direction: { type: BaseTypes.TYPES.FLOAT32 },
            speed: { type: BaseTypes.TYPES.FLOAT32 },
            headRadius: { type: BaseTypes.TYPES.FLOAT32 },
            trail: {
              type: BaseTypes.TYPES.LIST,
              itemType: BaseTypes.TYPES.CLASSINSTANCE
            }
        }, super.netScheme);
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.class = Wiggle;
        this.trail = [];
    }

    syncTo(other) {
        super.syncTo(other);
        this.direction = other.direction;
        this.speed = other.speed;
        this.headRadius = other.headRadius;
        this.trail = other.trail;
    }
}
