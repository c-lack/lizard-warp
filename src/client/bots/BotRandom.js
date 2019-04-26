let config = require('../../common/config.json');

class BotRandom {
    constructor(game, left, right, straight) {
        this.game = game;
        this.left = left;        
        this.right = right;
        this.straight = straight;

        this.bot_interval = setInterval(() => {
            this.calc_move();
        }, config.bot_interval);
    }

    disable_interval() {
        clearInterval(this.bot_interval);
    }

    calc_move() {
        if (Math.random() < 0.02) {
            let r = Math.random()
            if (r < 1/3) {
                this.left()
            } else if (r < 2/3) {
                this.right()
            } else {
                this.straight()
            }
        }
    }
}

exports.BotRandom = BotRandom;