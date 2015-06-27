'use strict';

var fs = require('fs');
var async = require('async');
var glob = require('globby');
var App = require('..');
var app = new App();


/**
 * Load "pages" with custom loaders
 */

app.loader('glob', function (views, opts) {
  return function (pattern) {
    return glob.sync(pattern);
  };
});

app.loader('read', ['glob'], function (views, opts) {
  return function (files) {
    return files.reduce(function (acc, fp) {
      acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
      return acc;
    }, views);
  };
});


app.create('page');
app.pages('test/fixtures/*.txt', ['read']);



/**
 * Load "posts" with default async loaders
 */

app.create('posts', {loaderType: 'async'});
app.posts('test/fixtures/*.txt', function (err) {
  console.log(app.views.posts);
});

