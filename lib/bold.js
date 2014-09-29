var ansi = require('ansi-styles');
var re = /\#\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

function wrap(str, color) {
  return ansi[color].open + str + ansi[color].close;
}

function makeBold(str) {
  var match = re.exec(str);
  if (match) {
    return wrap(match[1], 'bold');
  }
  return str;
}

module.exports = makeBold;

// console.log(makeBold('#{foo bar baz}'))