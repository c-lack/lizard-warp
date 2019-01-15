import ServerEngine from 'lance/ServerEngine';
import TwoVector from 'lance/serialize/TwoVector';
import Wiggle from '../common/Wiggle';

export default class WiggleServerEngine extends ServerEngine {

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.gameEngine.on('postStep', this.stepLogic.bind(this));
    }

    start() {
      super.start();
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        let player = new Wiggle(this.gameEngine, null, { position: this.gameEngine.randPos().multiplyScalar(0.7) });
        player.direction = 2*Math.PI*Math.random();
        player.speed = 0.02;
        player.headRadius = 0.5;
        player.playerId = socket.playerId;
        this.gameEngine.addObjectToWorld(player);
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);
        let playerWiggle = this.gameEngine.world.queryObject({ playerId });
        if (playerWiggle) this.gameEngine.removeObjectFromWorld(playerWiggle.id);
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

                // trail
                w2.trail.map((p) => {
                  let pos = new TwoVector(p.x, p.y);
                  let distance = pos.subtract(w.position);
                  if (distance.length() < 0.35*w.headRadius + w2.headRadius/10) {
                    this.killWiggle(w);
                  }
                })

                // Head to head
                let distance = w2.position.clone().subtract(w.position);
                if (distance.length() < 0.35*w.headRadius + 0.35*w2.headRadius) {
                  this.killWiggle(w);
                  this.killWiggle(w2);
                }
            }

            // own trail
            w.trail.map((p) => {
              if (Math.abs(w.direction - p.z) < 0.5) {
                return
              }
              let pos = new TwoVector(p.x, p.y)
              let distance = pos.subtract(w.position);
              if (distance.length() < 0.35*w.headRadius + w.headRadius/10) {
                this.killWiggle(w);
              }
            })

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
