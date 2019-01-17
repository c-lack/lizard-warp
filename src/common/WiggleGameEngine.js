import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import TwoVector from 'lance/serialize/TwoVector';
import Wiggle from './Wiggle';
import Trails from './Trails';

export default class WiggleGameEngine extends GameEngine {

    constructor(options) {
        super(options);
        this.physicsEngine = new SimplePhysicsEngine({ gameEngine: this });
        this.on('preStep', this.moveAll.bind(this));

        // game variables
        Object.assign(this, {
            headRadius: 0.1, bodyRadius: 0.1,
            spaceWidth: 16, spaceHeight: 9,
        });
    }

    registerClasses(serializer) {
        serializer.registerClass(Wiggle);
        serializer.registerClass(Trails);
    }

    start() {
      super.start();
    }

    randPos() {
      let x = (Math.random() - 0.5) * this.spaceWidth;
      let y = (Math.random() - 0.5) * this.spaceHeight;
      return new TwoVector(x, y);
    }

    moveAll(stepInfo) {

        if (stepInfo.isReenact)
            return;

        let trails = this.world.queryObject({ instanceType: Trails });

        this.world.forEachObject((id, obj) => {
            if (obj instanceof Wiggle) {

                // add to trail
                trails.add(obj.position.clone());

                let move = new TwoVector(Math.cos(obj.direction), Math.sin(obj.direction));
                move.multiplyScalar(obj.speed);
                obj.position.add(move);
            }
        });
    }

    processInput(inputData, playerId) {

        super.processInput(inputData, playerId);

        // get the player's primary object
        let player = this.world.queryObject({ playerId });
        if (player) {
            if (inputData.input === 'left') {
              player.direction -= 0.04;
            } else if (inputData.input === 'right') {
              player.direction += 0.04;
            // } else if (inputData.input === 'up') {
            //   player.headRadius *= 1.01;
            // } else if (inputData.input === 'down') {
            //   player.headRadius *= 0.99;
            }
        }
    }
}
