'use strict';

var fs = require('fs');
var path = require('path');
var mm = require('micromatch');
var get = require('get-value');
var set = require('set-value');
var flatten = require('arr-flatten');
var isObject = require('is-extendable');
var reduce = require('object.reduce');
var extend = require('extend-shallow');
var typeOf = require('kind-of');

/**
 * Expose `utils`
 */

var utils = module.exports;

/**
 * Array utils
 */

utils.flatten = flatten;
utils.isObject = isObject;
utils.reduce = require('object.reduce');

/**
 * Cast `val` to an array.
 */

utils.arrayify = function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Concatenate and flatten multiple arrays, filtering
 * falsey values from the result set.
 *
 * @param {Array} `arrays` One or more arrays
 * @return {Array}
 */

utils.union = function union() {
  var arr = [].concat.apply([], [].slice.call(arguments));
  return utils.flatten(arr).filter(Boolean);
};

/**
 * Base utils
 *
 * Used in classes and other methods.
 */

/**
 * Default router methods used in all Template instances
 */

utils.methods = [
  'onLoad',
  'preCompile',
  'preLayout',
  'postLayout',
  'onMerge',
  'postCompile',
  'preRender',
  'postRender'
];

/**
 * Return the first object with a key that matches
 * the given glob pattern.
 *
 * @param {Object} `object`
 * @param {String|Array} `patterns`
 * @param {Object} `options`
 * @return {Object}
 */

utils.matchKey = function matchKey(obj, patterns, options) {
  if (typeof obj === 'undefined') return null;
  var keys = mm(Object.keys(obj), patterns, options);
  return obj[keys[0]];
};

/**
 * Return all objects with keys that match
 * the given glob pattern.
 *
 * @param {Object} `object`
 * @param {String|Array} `patterns`
 * @param {Object} `options`
 * @return {Object}
 */

utils.matchKeys = function matchKeys(obj, patterns, options) {
  var keys = mm(Object.keys(obj), patterns, options).sort();
  var len = keys.length, i = 0;
  var res = {};

  while (len--) {
    var key = keys[i++];
    res[key] = obj[key];
  }
  return res;
};

/**
 * Cast `val` to an array.
 */

utils.error = function error(msg, val) {
  throw new Error(msg + JSON.stringify(val));
};

/**
 * Function utils.
 * ----------------------------------------
 */

/**
 * Noop
 */

utils.noop = function noop() {
  return;
};

/**
 * Returns the first argument passed to the function.
 */

utils.identity = function identity(val) {
  return val;
};

/**
 * Forward late-bound methods onto the `receiver` instance,
 * which will later be invoked in the context of the provider.
 */

utils.forward = function forward(receiver, provider, methods) {
  methods.forEach(function (method) {
    receiver[method] = function () {
      return provider[method].apply(provider, arguments);
    };
  });
  return receiver;
};

/**
 * Delegate non-enumerable properties from `provider` to `receiver`.
 *
 * @param  {Object} `receiver`
 * @param  {Object} `provider`
 */

utils.delegate = function delegate(receiver, provider) {
  for (var method in provider) {
    utils.defineProp(receiver, method, provider[method]);
  }
};

utils.delegateAll = function delegateAll (receiver/*, objs */) {
  var providers = [].slice.call(arguments, 1);
  providers.forEach(function (provider) {
    utils.delegate(receiver, provider);
  });
};

/**
 * Add a non-enumerable property to `receiver`
 *
 * @param  {Object} `obj`
 * @param  {String} `name`
 * @param  {Function} `val`
 */

utils.defineProp = function defineProp(receiver, key, value) {
  return Object.defineProperty(receiver, key, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: value
  });
};

/**
 * Partially apply arguments that are prepended to the arguments provided
 * to the returned function.
 *
 * @param  {Function} `fn`
 * @return {Function}
 */

utils.partial = function partial(ctx, fn/*, arguments*/) {
  var leftArgs = [].slice.call(arguments, 2);
  return function () {
    var args = leftArgs.concat([].slice.call(arguments));
    return fn.apply(ctx, args);
  };
};

/**
 * Partially apply arguments that are appended to the arguments provided
 * to the returned function.
 *
 * @param  {Function} `fn`
 * @return {Function}
 */

utils.partialRight = function partialRight(ctx, fn/*, arguments*/) {
  var rightArgs = [].slice.call(arguments, 2);
  return function () {
    var args = [].slice.call(arguments).concat(rightArgs);
    return fn.apply(ctx, args);
  };
};

/**
 * Bind a `thisArg` to all the functions on the target
 *
 * @param  {Object|Array} `target` Object or Array with functions as values that will be bound.
 * @param  {Object} `thisArg` Object to bind to the functions
 * @return {Object|Array} Object or Array with bound functions.
 */

utils.bindAll = function bindAll(target, thisArg) {
  if (Array.isArray(target)) {
    return utils.bindEach(target, thisArg);
  }
  return reduce(target, function (acc, fn, key) {
    if (typeof fn === 'object' && typeof fn !== 'function') {
      acc[key] = utils.bindAll(fn, thisArg);
    } else {
      acc[key] = fn.bind(thisArg);
      if (fn.async) {
        acc[key].async = fn.async;
      }
    }
    return acc;
  }, {});
};

utils.bindEach = function bindEach(target, thisArg) {
  for (var i = 0; i < target.length; i++) {
    target[i] = target[i].bind(thisArg);
  }
  return target;
};

/**
 * File system utils.
 */

utils.tryRead = function tryRead(fp) {
  try {
    return fs.readFileSync(fp, 'utf8');
  } catch (err) {
    return null;
  }
};

/**
 * Class utils
 */

utils.setProto = function setProto(obj, proto) {
  return Object.setPrototypeOf
    ? Object.setPrototypeOf(obj, proto)
    : (obj.__proto__ = proto);
};


utils.protoTree = function protoTree(obj) {
  var tree = {};
  do {
    var name = obj.constructor.name;
    if (name !== 'Object') {
      tree[name] = Object.getOwnPropertyNames(obj);
    }
  } while (obj = Object.getPrototypeOf(obj));
  return tree;
};

utils.nativeKeys = function nativeKeys(obj) {
  return Object.getOwnPropertyNames(obj.constructor);
};

utils.observe = function observe(obj) {
  Object.observe(obj, function(changes) {
    changes.forEach(function (change) {
      // console.log(change)
    });
  });
};

utils.assign = function assign(thisArg) {
  return function() {
    var args = [].slice.call(arguments);
    return extend.apply(extend, [thisArg].concat(args));
  };
};

/**
 * Call `method` on each value in `obj`.
 *
 * @param  {Object} `thisArg` The context in which to invoke `method`
 * @param  {String} `method` Name of the method to call on `thisArg`
 * @param  {Object} `obj` Object to iterate over
 * @return {Object} `thisArg` for chaining.
 */

utils.visit = function visit(thisArg, method, obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      thisArg[method](key, obj[key]);
    }
  }
  return thisArg;
};

/**
 * Map `visit` over an array of objects.
 *
 * @param  {Object} `thisArg` The context in which to invoke `method`
 * @param  {String} `method` Name of the method to call on `thisArg`
 * @param  {Object} `arr` Array of objects.
 * @return {Object} `thisArg` for chaining.
 */

utils.mapVisit = function mapVisit(thisArg, method, arr) {
  arr.forEach(function (obj) {
    utils.visit(thisArg, method, obj);
  });
};

/**
 * Make properties on the given `obj` enumerable.
 *
 * @param  {Object} `obj`
 * @return {Object} Object with enumerable properties.
 * @api public
 */

utils.makeEnumerable = function makeEnumerable(obj) {
  var keys = Object.getOwnPropertyNames(obj);
  var len = keys.length, res = {};
  while (len--) {
    var key = keys[len];
    Object.defineProperty(res, key, {
      enumerable: true,
      value: obj[key]
    });
  }
  return res;
};

/**
 * Get the keys of all prototype methods for the given object.
 */

utils.protoKeys = function protoKeys(o) {
  if (!o || typeof o !== 'object') return [];
  var proto = Object.getPrototypeOf(o);
  return Object.keys(proto);
};

/**
 * Views utils
 */

var utils = module.exports;

/**
 * Properties to allow on the root of a template from vinyl file objects
 */

utils.vinylProps = [
  'base',
  'contents',
  'content',
  'history',
  'path',
  'relative'
];

utils.getLocals = function getLocals(locals, options) {
  options = options || {};
  locals = locals || {};
  var ctx = {};

  if (options.hasOwnProperty('hash')) {
    extend(ctx, locals);
    extend(ctx, options.hash);

  } else if (locals.hasOwnProperty('hash')) {
    extend(ctx, locals.hash);

  } else if (!locals.hasOwnProperty('hash') && !options.hasOwnProperty('hash')) {
    extend(ctx, options);
    extend(ctx, locals);
  }

  return ctx;
};

utils.toTemplate = function toTemplate(fn, file) {
  var keys = ['_contents', 'stat', 'history'];
  var res = {}, template = {};
  for (var key in file) {
    if (file.hasOwnProperty(key) && keys.indexOf(key) === -1) {
      res[key] = file[key];
    }
  }
  res.path = file.path;
  if (file.contents) {
    res.content = file.contents.toString();
  } else {
    res.contents = new Buffer(file.content);
  }
  template[file.path] = res;
  fn(res);
  return res;
};

/**
 * Separate args from options. Returns an array with
 * two elements, where the first element is options
 * and the second an array of arguments.
 */

utils.slice = function slice(arr, i) {
  var args = [].slice.call(arr, i);
  var opts = {};
  if (!utils.isLoader(args[0])) {
    opts = args.shift();
  }
  var last = args[args.length - 1];
  if (isObject(last) && !utils.isLoader(last)) {
    extend(opts, args.pop());
  }
  opts = opts || {};
  return flatten([opts, args]);
};

/**
 * Default renameKey function
 */

utils.renameKey = function renameKey(app) {
  return function (fp, options) {
    var opts = extend({}, app.options, options);
    var fn = opts.renameKey || path.basename;
    return fn(fp);
  };
};

/**
 * Rename each key in the give `obj`
 */

utils.rename = function rename(views, fn) {
  if (typeof fn !== 'function') {
    fn = path.basename;
  }
  for (var key in views) {
    if (views.hasOwnProperty(key)) {
      views[fn(key)] = views[key];
      delete views[key];
    }
  }
};

/**
 * Ensure file extensions are formatted properly for lookups.
 *
 * ```js
 * utils.formatExt('hbs');
 * //=> '.hbs'
 *
 * utils.formatExt('.hbs');
 * //=> '.hbs'
 * ```
 *
 * @param {String} `ext` File extension
 * @return {String}
 * @api public
 */

utils.formatExt = function formatExt(ext) {
  if (typeof ext !== 'string') {
    throw new Error('formatExt() expects `ext` to be a string.');
  }
  if (ext.charAt(0) !== '.') {
    return '.' + ext;
  }
  return ext;
};

/**
 * Strip the dot from a file extension
 *
 * ```js
 * utils.stripDot('.hbs');
 * //=> 'hbs'
 * ```
 *
 * @param {String} `ext` extension
 * @return {String}
 * @api public
 */

utils.stripDot = function stripDot(ext) {
  if (typeof ext !== 'string') {
    throw new Error('utils.stripDot() expects `ext` to be a string.');
  }
  if (ext.charAt(0) === '.') {
    return ext.slice(1);
  }
  return ext;
};

/**
 * Sanitize an array of file extensions. Strips the dot and
 * ensures they can be converted to regex or glob patterns.
 *
 * This is used by the `extensionRe()` util for creating
 * a regex to match the given file extensions.
 *
 * @param  {Array} `extensions` Array of file extensions
 * @return {Array}
 * @api public
 */

utils.exts = function exts(arr) {
  if (!Array.isArray(arr)) throw new Error('utils.exts() expects an array.');
  return arr.reduce(function (acc, ext) {
    if(ext !== '.*') {
      return acc.concat(utils.stripDot(ext));
    }
    return acc;
  }, []);
};

/**
 * Create a glob pattern for an array of file extensions.
 *
 * @param  {Array} `exts` Array of file extensions
 * @return {String} Glob pattern
 * @api public
 */

utils.extsPattern = function extsPattern(exts) {
  var arr = utils.union(utils.exts(exts));
  if (arr.length === 1) return '.' + arr[0];
  return '.{' + arr.join('|') + '}';
};

/**
 * Creates a regex to match only the file extensions of registered
 * engines.
 *
 * This is used by the default middleware to prevent unregistered
 * extensions from being processed.
 *
 * @param  {String} `str`
 * @return {RegExp}
 * @api public
 */

utils.extensionRe = function extensionRe(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('utils.extensionRe() expects an array.');
  }
  return new RegExp('(?:' + utils.exts(arr).join('|') + ')$');
};

/**
 * Return true if the given value is a loader.
 *
 * @param  {Object} `val`
 * @return {Boolean}
 */

utils.isLoader = function isLoader(val, cache) {
  return typeof val === 'function'
    || cache && typeof val === 'string' && cache[val]
    || utils.isStream(val)
    || utils.isPromise(val)
    || Array.isArray(val);
};

/**
 * Return true if the given object is a stream.
 *
 * @param  {Object} `val`
 * @return {Boolean}
 */

utils.isStream = function isStream (val) {
  return val && isObject(val) && typeof val.pipe === 'function';
};

/**
 * Return true if the given object is a promise.
 *
 * @param  {Object} `val`
 * @return {Boolean}
 */

utils.isPromise = function isPromise (val) {
  return val && isObject(val) && typeof val.then === 'function';
};

/**
 * Validate that the given `view` is an object with `path` and `content`
 * properties.
 *
 * @param  {Object} `view`
 * @param  {Function} `next` Optional callback
 * @return {}
 */

utils.validate = function validate(view, next) {
  var error;
  if (typeOf(view) !== 'object') {
    error = this.error('validate', 'views are expected to be objects.');
    if (next) return next(error);
    throw error;
  }

  if (!view.path) {
    error = this.error('validate', 'view.path must be a string.');
    if (next) return next(error);
    throw error;
  }

  if (typeOf(view.content) !== 'string') {
    error = this.error('validate', 'view.content must be a string.');
    if (next) return next(error);
    throw error;
  }

  if (typeof next === 'function') {
    next();
  }
};

