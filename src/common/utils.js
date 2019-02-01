let colors = shuffle(require('../common/colors.json'));
let Victor = require('victor');

let config = require('./config.json');

let width = config.board_width;
let height = config.board_height;

exports.random_color = () => {
  colors.push(colors.shift());
  return {name: colors[0][0], code: colors[0][1]};
}

exports.random_pos = () => {
  return new Victor(
    config.start_scalar*(Math.random()-config.max_board)*width,
    config.start_scalar*(Math.random()-config.max_board)*height
  );
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
