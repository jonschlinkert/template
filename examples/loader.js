'use strict';

var Template = require('..');
var template = new Template();

template.iterator('sync', require('iterator-sync'));
template.iterator('async', require('iterator-async'));

template.loader('d', {e: 'f'}, function a() {});
template.loader('c', function a() {});
template.loader('c', function a() {});
template.loader('c', function a() {});
template.loader('c', function a() {});
template.loader('c', function a() {});
template.loader('c', function a() {});
template.loader('c', function b() {
  }, function c() {
  }, function d() {
  }, function e() {
});

console.log(template.loaders('c'));
