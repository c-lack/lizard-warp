let colors = shuffle(require('../common/colors.json'));
let Victor = require('victor');

const height = 1;
const width = 1;

exports.random_color = () => {
  colors.push(colors.shift());
  return {name: colors[0][0], code: colors[0][1]};
}

exports.random_pos = () => {
  return new Victor(
    0.7*(Math.random()-0.5)*width,
    0.7*(Math.random()-0.5)*height
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
