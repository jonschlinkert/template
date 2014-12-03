'use strict';

var fs = require('fs')
var Template = require('./')
var template = new Template();

// template.loader('foo', function () {
//   // body...
// })
// template.loader('bar', function () {
//   // body...
// })
// template.loader('baz', function () {
//   // body...
// })

// template.create('include', {isPartial: true, asynLoader: true}, ['foo', 'bar'])
// template.page('home', {content: 'This is content'}, ['baz'])

template.loader('read', function (fp) {
  return fs.readFileSync(fp, 'utf8');
});

template.loader('parse', function (fp) {
  return fs.readFileSync(fp, 'utf8');
});

console.log(template._.loaders)