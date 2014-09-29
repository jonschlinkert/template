'use strict';

var ansi = require('ansi-styles');
var re = /\#\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;


module.exports = function makeBold(str) {
  var match = re.exec(str);
  if (match) {
    return wrap(match[1], 'bold');
  }
  return str;
};


function wrap(str, color) {
  return ansi[color].open + str + ansi[color].close;
}