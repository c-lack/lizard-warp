let config = require('../../common/config.json');
let Victor = require('victor');

class BotAlex {
    constructor(game, left, right, straight) {
        this.game = game;
        this.left = left;        
        this.right = right;
        this.straight = straight;
        this.bot_name = "bot_alex"

        this.lizard = this.get_lizard();

        this.bot_interval = setInterval(() => {
            this.calc_move();
        }, config.bot_interval);
    }

    disable_interval() {
        clearInterval(this.bot_interval);
    }

    get_canvas() {
        return document.getElementById("canvas_trail").getContext("2d");
    }

    get_lizard() {
        let this_lizard
        this.game.players.map((l) => {
            if (l.username === this.bot_name) {
                this_lizard = l;
                return
            }
        });
        return this_lizard;
    }

    match_dir(dir) {
        if (this.lizard.dir < dir) {
            this.right();
        } else if (this.lizard.dir > dir) {
            this.left();
        } else {
            this.straight();
        }
    }

    calc_move() {
        // Avoid other lizards
        let sum_vecs = new Victor(0,0);
        this.game.players.map((l) => {
            if (l.username === this.bot_name) {
                return
            }
            sum_vecs = sum_vecs.add(
                this.lizard.pos.clone().norm()
                .subtract(l.pos.clone().norm()).norm());
        });
        
        // Avoid walls
        sum_vecs.add(this.lizard.pos.clone().invert().multiply(new Victor(2,2)))

        this.match_dir(sum_vecs.angle())
    }
}

exports.BotAlex = BotAlex;