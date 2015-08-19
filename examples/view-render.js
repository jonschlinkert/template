'use strict';

var App = require('..');
var app = new App();

app.engine('tmpl', require('engine-lodash'));

/**
 * Create a view collection
 */
app.create('pages');

/**
 * Load views onto the collection you created
 */

app.page('welcome.tmpl', {path: 'welcome.tmpl', content: 'Hello, <%= name %>!'})
  .page('goodbye.tmpl', {path: 'goodbye.tmpl', content: 'Goodbye, <%= name %>!'});

// get a template
var page = app.pages.get('welcome.tmpl');

// render a template
page.render({name: 'Bob'}, function (err, res) {
  if (err) return console.log(err);
  console.log(res.content);
  //=> 'Hello, Bob!'

  app.pages.get('goodbye.tmpl')
    .render({name: 'Bob'}, function (err, res) {
      if (err) return console.log(err);
      console.log(res.content);
      //=> 'Goodbye, Bob!'
    });
});
