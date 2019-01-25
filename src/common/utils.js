var colors = require('../common/colors.json');
var Victor = require('victor');

const height = 10;
const width = 10;

exports.random_color = () => {
  var num_colors = Object.keys(colors).length;
  var rand_ind = Math.random()*num_colors << 0;
  var key = Object.keys(colors)[rand_ind];
  var color = colors[key];
  delete colors[key];
  return {name: key, code: color};
}

exports.random_pos = () => {
  return new Victor(
    0.7*(Math.random()-0.5)*width,
    0.7*(Math.random()-0.5)*height
  );
}
