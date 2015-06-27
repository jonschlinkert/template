'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('globby');
var App = require('../lib/loaders.js');
var utils = require('../lib/utils');

// function App(options) {
//   this.options = options || {};
//   this.decorate('iterator');
//   this.decorate('loader', 'set');
//   this.decorate('seq');
//   this.decorate('first');
//   this.decorate('last');
//   this.decorate('get');
//   this.decorate('resolve');
//   this.decorate('compose');
// }

// App.prototype.iterator = function(type, options, fn) {
//   if (typeof options === 'function') {
//     fn = options;
//     options = {};
//   }
//   options = options || {};
//   options.type = type;
//   this[type] = new LoaderCache(options, fn);
// };

// App.prototype.getType = function(args, options, stack) {
//   var args = [].slice.call(args, 1);
//   var opts = !utils.isLoader(options) ? args.shift() : {};
//   if (!opts || typeof opts === 'function') return 'sync';
//   return opts.loaderType || 'sync';
// };

// App.prototype.decorate = function(method, alias) {
//   utils.defineProp(this, method, function(name, opts, stack) {
//     var type = this.getType(arguments);
//     var inst = this[type];
//     return inst[alias || method].apply(inst, arguments);
//   });
// };

/**
 * Example
 */

var app = new App({iterator: 'sync'});

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


app.loader('glob', glob.sync.bind(glob));
app.loader('foo', app.seq('glob'));

app.first('a', app.seq('foo'));

app.loader('a', function a(files) {
  return files;
});
app.loader('a', function a(files) {
  return files;
});
app.loader('a', function a(files) {
  return files;
});

// pages opts
var opts = {collection: 'pages', inflection: 'page'};
// pages views
var collection = {
  'abc.md': {path: 'abc.md', content: '...'},
  'xyz.md': {path: 'xyz.md', content: '...'},
};

function last(opts, collection) {
  return function(files) {
    files.forEach(function (fp) {
      collection[path.basename(fp)] = {
        content: fs.readFileSync(fp, 'utf8'),
        path: fp
      };
    });
    return collection;
  };
}

app.loader('read', function (fp) {
  return fs.readFileSync(fp, 'utf8');
});

app.loader('map', function (arr, fn, thisArg) {
  return arr.map(function (item) {
    return fn.call(thisArg || this, item);
  }.bind(this));
});

app.loader('toView', function (fp) {
  return {content: fs.readFileSync(fp, 'utf8'), path: fp};
});

app.loader('wrapper', function (collection, options, stack) {
  var len = stack.length, i = 0;
  var loaders = new Array(len);
  while (len--) loaders[i] = stack[i++](collection, options);
  return loaders;
});

app.loader('toTemplate', function (acc, fp) {
  acc[fp] = app.seq('toView')(fp);
  return acc;
});

app.loader('toViews', function (files) {
  var stack = app.seq('toTemplate');
  return files.reduce(stack, collection);
});

app.first('last', function (opts, collection) {
  return app.seq('toViews');
});

// app.first('last', function (opts, collection) {
//   return function(files) {
//     return files.reduce(function (acc, fp) {
//       acc[path.basename(fp)] = {content: fs.readFileSync(fp, 'utf8'), path: fp};
//       return acc;
//     }, collection);
//   };
// });

// app.last('a', app.compose('last')(opts, collection));
app.last('a', last(opts, collection));

app.first('b', function bFirst() {});

app.loader('files', function(files) {
  return files.map(function (fp) {
    return path.resolve(fp);
  });
});

app.loader('b', function b() {});
app.loader('b', function bb() {});
app.last('b', function bLast() {});

app.loader('one', function one() {});
app.loader('two', function two() {});
app.loader('j', function j() {}, ['one', 'two']);
app.loader('c', ['b', 'a']);
app.loader('d', ['c']);
app.loader('e', ['b', 'a', 'c']);
app.loader('f', ['e'], function f() {}, ['j']);

var stack = app.get('f');
// console.log(stack)

var fn = app.compose('a', ['files']);
fn('test/fixtures/*.txt');
console.log(app);


