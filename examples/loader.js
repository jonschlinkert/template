'use strict';

var App = require('..');
var app = new App();

app.iterator('sync', require('iterator-sync'));
app.iterator('async', require('iterator-async'));

app.loader('a', function a() {});
app.loader('b', function b() {});
app.loader('c', function c() {});
app.loader('d', {e: 'f'}, function d() {});
app.loader('c', function a() {});
app.loader('c', function a() {});
app.loader('c', function a() {});
app.loader('c', function b() {
  }, function c() {
  }, function d() {
  }, function e() {
});

console.log(app.loaders);
