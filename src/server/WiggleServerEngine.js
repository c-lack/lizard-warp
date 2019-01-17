import ServerEngine from 'lance/ServerEngine';
import TwoVector from 'lance/serialize/TwoVector';
import Wiggle from '../common/Wiggle';
import Trails from '../common/Trails';

export default class WiggleServerEngine extends ServerEngine {

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.gameEngine.on('postStep', this.stepLogic.bind(this));
    }

    start() {
      super.start();

      let trails = new Trails(this.gameEngine, null, {});
      this.gameEngine.addObjectToWorld(trails);
    }

    startSpeed(playerId) {
        let playerWiggle = this.gameEngine.world.queryObject({ playerId });
        if (playerWiggle) {
            playerWiggle.speed = 0.02;
        }
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        let player = new Wiggle(this.gameEngine, null, { position: this.gameEngine.randPos().multiplyScalar(0.7) });
        player.direction = 2*Math.PI*Math.random();
        player.speed = 0.0001;
        player.headRadius = 0.5;
        player.playerId = socket.playerId;
        this.gameEngine.addObjectToWorld(player);
        setTimeout(() => {this.startSpeed(socket.playerId)}, 20);
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);
        let playerWiggle = this.gameEngine.world.queryObject({ playerId });
        if (playerWiggle) {
            this.gameEngine.removeObjectFromWorld(playerWiggle.id);
        }
    }

    killWiggle(w) {
      w.speed = 0;
    }

    stepLogic() {
        let wiggles = this.gameEngine.world.queryObjects({ instanceType: Wiggle });
        for (let w of wiggles) {

            // check for collision
            for (let w2 of wiggles) {
                if (w === w2)
                    continue;

                // Head to head
                let distance = w2.position.clone().subtract(w.position);
                if (distance.length() < 0.35*w.headRadius + 0.35*w2.headRadius) {
                  this.killWiggle(w);
                  this.killWiggle(w2);
                }
            }

            // wall
            var x = w.position.x;
            var y = w.position.y;
            if (( x + 0.35*w.headRadius > 8 )
                || ( x - 0.35*w.headRadius < -8 )
                || ( y + 0.35*w.headRadius > 4.5 )
                || ( y - 0.35*w.headRadius < -4.5 )) {
              this.killWiggle(w);
            }
        }
    }
}
