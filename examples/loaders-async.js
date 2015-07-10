
var fs = require('fs');
var path = require('path');
var through = require('through2');
var glob = require('globby');
var File = require('vinyl');
var App = require('..');
var app = new App();


// async loader
app.loader('base', { loaderType: 'async' }, function (views, options) {
  return function (key, value, locals, next) {
    var results = {};
    value.path = value.path || key;
    views.set(key, value);
    results[key] = value;
    next(null, results);
  };
});

// create a custom view collection, "pages", using the `base`
// loader.
app.create('page', opts, ['base']);

// load some pages
app.pages('home', {content: 'this is content...'}, opts,
  function (err, views) {
    if (err) console.error(err);
    console.log('callback', app.views.pages);
  });
