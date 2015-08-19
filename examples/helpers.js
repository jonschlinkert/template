'use strict';

var App = require('..');
var app = new App();

/**
 * engine
 */
app.engine('md', require('engine-lodash'));


/**
 * Helpers
 */
app.helper('double', function (str) {
  return str + '-' + str;
});

app.helper('before', function (str) {
  return 'before-' + str;
});

app.helper('after', function (str) {
  return str + '-after';
});


/**
 * Cust template collection
 */
app.create('page', { loaderType: 'sync' });


/**
 * Load templates
 */
app.pages('a.md', {
    path: 'a.md',
    title: 'a',
    content: 'This is <%= title %>'
  })
  .pages('b.md', {
    path: 'b.md',
    title: 'b',
    content: 'This is <%= title %>'
  })
  .pages('c.md', {
    path: 'c.md',
    title: 'c',
    content: 'This is <%= title %>'
  })
  .pages('d.md', {
    path: 'd.md',
    title: 'd',
    content: 'This is <%= title %>'
  })
  .render('a.md', function (err, res) {
    console.log(arguments)
  })

// console.log(app.views.pages);
