'use strict';

var fs = require('fs');
var path = require('path');
var extend = require('extend-shallow');
var utils = require('./lib/utils');
var glob = require('globby');

/**
 * Create an instance of `Loaders` with the given `options`.
 *
 * @param {Object} `options`
 */

function Loaders(options) {
  this.options = options || {};
  this.iterators = this.iterators || {};
}

Loaders.prototype.iterator = function(type, fn) {
  this.iterators[type] = fn
  return this;
};

Loaders.prototype.createStack = function(name) {
  this[name] = this[name] || {};
  this[name].stack = this[name].stack || [];
  this[name].first = this[name].first || utils.noop;
  this[name].last = this[name].last || utils.noop;
  return this;
};

Loaders.prototype.set = function(name, loaders) {
  this.createStack(name);
  this[name].stack = this.union(name, [].slice.call(arguments, 1));
  return this;
};

Loaders.prototype.union = function(name, fns) {
  this.createStack(name);
  return utils.union(this[name].stack, fns);
};

Loaders.prototype.get = function(name) {
  return this[name] ? this[name].stack : name;
};

Loaders.prototype.first = function(name, fn) {
  var stack = [].slice.call(arguments, 1);
  this.createStack(name);
  this[name].first = this.resolve(stack);
  return this;
};

Loaders.prototype.last = function(name, fn) {
  var stack = [].slice.call(arguments, 1);
  this.createStack(name);
  this[name].last = this.resolve(stack);
  return this;
};

Loaders.prototype.getLoaderType = function(options) {
  var opts = extend({loaderType: this.options.defaultType}, options);
  var type = opts.loaderType;
  if (!this.iterators[type]) {
    throw new Error('Loaders: invalid loader type: ' + type);
  }
  return type;
};

Loaders.prototype.resolve = function() {
  var args = utils.union([].slice.call(arguments));
  var res = [], self = this;

  function build(stack) {
    stack = self.get(stack);
    var len = stack.length, i = 0;

    while (len--) {
      var val = self.get(stack[i++]);
      if (Array.isArray(val)) {
        build(val, res);
      } else {
        res.push(val);
      }
    }
    return res;
  }
  return build(args);
};


Loaders.prototype.compose = function(name, options, stack) {
  var args = [].slice.call(arguments, 1);
  var opts = !utils.isLoader(options) ? args.shift() : {};
  var type = this.getLoaderType(opts);
  var iterator = this.iterators[type];

  stack = this.resolve(this.get(name).concat(args));
  var ctx = {};
  ctx.app = this;
  ctx.options = options;

  return function () {
    var args = [].slice.call(arguments).filter(Boolean);
    var len = args.length, loaders = [], cb = null;

    while (len-- > 1) {
      var arg = args[len];
      if (!utils.isLoader(arg)) break;
      loaders.unshift(args.pop());
    }

    // combine the `create` and collection stacks
    stack = stack.concat(this.resolve(loaders));

    // if loading is async, move the done function to args
    if (type === 'async') {
      args = args.concat(stack.pop());
    }

    // add first and last loaders
    stack.unshift(this[name].first);
    stack.push(this[name].last);

    stack = this.resolve(stack);

    // create the actual `load` function
    var load = iterator.call(this, stack);
    return load.apply(ctx, args);
  }.bind(this);
};


/**
 * Example
 */

var loaders = new Loaders({defaultType: 'sync'});

loaders.iterator('sync', function (stack) {
  var fn = stack.shift();
  return function () {
    var args = [].slice.call(arguments);
    var init = fn.apply(this, args);
    return stack.reduce(function (val, fn) {
      return fn.call(this, val);
    }.bind(this), init);
  }.bind(this);
});

loaders.set('glob', glob.sync.bind(glob));
loaders.set('foo', loaders.get('glob'));

loaders.first('a', loaders.get('foo'));

loaders.set('a', function a(files) {
  return files;
});
loaders.set('a', function a(files) {
  return files;
});
loaders.set('a', function a(files) {
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
    return files.reduce(function (acc, fp) {
      acc[path.basename(fp)] = {
        content: fs.readFileSync(fp, 'utf8'),
        path: fp
      };
      return acc;
    }, collection);
  };
}

loaders.last('a', last(opts, collection));

loaders.first('b', function bFirst() {});

loaders.set('files', function(files) {
  return files.map(function (fp) {
    return path.resolve(fp);
  });
});

loaders.set('b', function b() {});
loaders.set('b', function bb() {});
loaders.last('b', function bLast() {});

loaders.set('one', function one() {});
loaders.set('two', function two() {});
loaders.set('j', function j() {}, ['one', 'two']);
loaders.set('c', ['b', 'a']);
loaders.set('d', ['c']);
loaders.set('e', ['b', 'a', 'c']);
loaders.set('f', ['e'], function f() {}, ['j']);

var stack = loaders.get('f');

var fn = loaders.compose('a', ['files']);
fn('test/fixtures/*.txt');
console.log(collection);

