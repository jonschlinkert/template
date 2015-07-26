var green = require('ansi-green');
var red = require('ansi-red');
var success = require('success-symbol');
var App = require('..');
var app = new App();

app.option({
  mixins: {
    shout: function (str) {
      console.log(red(str.toUpperCase() + '!'));
    }
  }
});

app.shout('hello');
//=> 'HELLO!'

/**
 * Create
 */
app.create('page');

