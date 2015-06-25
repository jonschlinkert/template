'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('globby');
var App = require('..');
var app = new App({iterator: 'sync'});


/**
 * Example
 */

app.iterator('sync', function (stack) {
  return function () {
    var args = [].slice.call(arguments);
    var init = stack[0].apply(this, args);

    if (stack.length === 1) return init;

    return stack.slice(1).reduce(function (val, fn) {
      return fn.call(this, val);
    }.bind(this), init);
  }.bind(this);
});

// app.first('a', app.loader('foo'));

// app.loader('a', function a(files) {
//   return files;
// });
// app.loader('a', function a(files) {
//   return files;
// });
// app.loader('a', function a(files) {
//   return files;
// });

// // pages opts
// var opts = {collection: 'pages', inflection: 'page'};
// // pages views
// var collection = {
//   'abc.md': {path: 'abc.md', content: '...'},
//   'xyz.md': {path: 'xyz.md', content: '...'},
// };

// function last(opts, collection) {
//   return function(files) {
//     return files.reduce(function (acc, fp) {
//       acc[path.basename(fp)] = {
//         content: fs.readFileSync(fp, 'utf8'),
//         path: fp
//       };
//       return acc;
//     }, collection);
//   };
// }

// app.last('a', last(opts, collection));

// // app.first('b', function bFirst() {});

// app.loader('files', function(files) {
//   return files.map(function (fp) {
//     return path.resolve(fp);
//   });
// });


app.loader('glob', glob.sync.bind(glob));
app.loader('foo', app.loader('glob'));

app.first('pages', app.loader('foo'));
// app.loader('pages', function() {
//   return;
// });

app.loader('aaa', function last(opts, collection) {
  console.log(arguments)
  return function(files) {
    return files.reduce(function (acc, fp) {
      acc[path.basename(fp)] = {
        content: fs.readFileSync(fp, 'utf8'),
        path: fp
      };
      return acc;
    }, collection);
  };
});

app.create('page', ['aaa']);
// console.log(app.loaders)

// app.loader('b', function b() {});
// app.loader('b', function bb() {});
// app.last('b', function bLast() {});

// app.loader('one', function one() {});
// app.loader('two', function two() {});
// app.loader('j', function j() {}, ['one', 'two']);
// app.loader('c', ['b', 'a']);
// app.loader('d', ['c']);
// app.loader('e', ['b', 'a', 'c']);
// app.loader('f', ['e'], function f() {}, ['j']);

// var stack = app.loader('f');

// var fn = app.compose('a', ['files']);
// fn('test/fixtures/*.txt');
app.pages('test/fixtures/*.txt');
console.log(app.views.pages);
