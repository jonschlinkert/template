var green = require('ansi-green');
var success = require('success-symbol');
var App = require('..');
var app = new App();

app.engine('*', require('engine-lodash'));

/**
 * Create
 */
app.create('page');


/**
 * Load
 */
app.pages('a', {path: 'a', content: 'aaa...'});
app.pages('b', {path: 'b', content: 'bbb...'});
app.pages('c', {path: 'c', content: 'ccc...'});
app.pages('d', {path: 'd', content: 'ddd...'})


var page = app.pages.get('a');

page.on('write', function (dest) {
  console.log(green(success), 'file written to', dest);
});

page.on('render', function (dest) {
  console.log(green(success), 'file written to', dest);
});

page.writeSync('test/actual/a.md');
