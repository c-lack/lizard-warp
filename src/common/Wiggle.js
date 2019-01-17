import BaseTypes from 'lance/serialize/BaseTypes';
import DynamicObject from 'lance/serialize/DynamicObject';

export default class Wiggle extends DynamicObject {

    static get netScheme() {
        return Object.assign({
            direction: { type: BaseTypes.TYPES.FLOAT32 },
            speed: { type: BaseTypes.TYPES.FLOAT32 },
            headRadius: { type: BaseTypes.TYPES.FLOAT32 }
        }, super.netScheme);
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.class = Wiggle;
    }

    syncTo(other) {
        super.syncTo(other);
        this.direction = other.direction;
        this.speed = other.speed;
        this.headRadius = other.headRadius;
    }
}
