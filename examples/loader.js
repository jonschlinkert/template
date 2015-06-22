'use strict';

var Template = require('..');
var template = new Template();

template.iterator('sync', require('iterator-sync'));
template.iterator('async', require('iterator-async'));

template.loader('a', function a() {});
template.loader('b', function b() {});
template.loader('c', function c() {});
template.loader('d', {e: 'f'}, function d() {});
template.loader('c', function a() {});
template.loader('c', function a() {});
template.loader('c', function a() {});
template.loader('c', function b() {
  }, function c() {
  }, function d() {
  }, function e() {
});

console.log(template.loaders);
