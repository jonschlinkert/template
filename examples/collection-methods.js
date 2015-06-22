'use strict';

/**
 * CollectionMethods is a class that only provides methods
 * for working on a collection of view objects.
 *
 * This allows chaining when either used as the `__proto__` for
 * a `Collection` directly or for a `function` that forwards
 * it's methods to `CollectionMethods` that are wrapping a `Collection`
 *
 * See example `App` below for the 2 different scenarios.
 *
 * @param {Collection} `views` Instance of `Collection
 */

function CollectionMethods (views) {
  // This might not be needed (didn't seem to work the way I though it would)
  // We should just require that a `views` object is passed in.
  if (views) {
    this.views = views;
  }

  Object.defineProperty(this, '_views', {
    enumerable: false,
    configurable: false,
    get: function () {
      // if the `views` object is reqiured, then we can just use `return this.views`
      return this.views || this;
    }
  });
}

/**
 * These are all methods that can be set on a Collection instance's `__proto__` or a
 * `function`'s `__proto__`
 */

CollectionMethods.prototype = {

  /**
   * Example of getting a value by key.
   */

  get: function (key) {
    return this._views[key];
  },

  /**
   * Example of setting a value by key.
   */

  set: function (key, value) {
    return (this._views[key] = value);
  },

  /**
   * Stupid filter example using a `cache` to store filtered properties
   * to enable chaining. This is similar to Jon's `filter.js` example.
   *
   * @param  {String} `name` Name of the cached object to store filter results
   * @param  {String} `key` Key to get from the `views` and put on the `cache`. (This is stupid filtering, should use `isMatch` here)
   * @return {Object} `this` which is either an instance of a `Collection` or a `function` (e.g. template.pages)
   */

  filter: function (name, key) {
    // this line could be moved to the constructor if we always require it to be added.
    if (!this.cache) this.defineProp('cache', {});
    this.cache[name] = this.cache[name] || {};
    this.cache[name][key] = this._views[key];
    return this;
  },

  /**
   * After some items have been filtered, get the final value from the cache.
   * By default the cache is not flushed (cleared). Passing `true` as `flush` will clear the cache
   * for the specified name.
   *
   * @param  {String} `name` Name of the cached object to retrieve filtered results.
   * @param  {Boolean} `flush` Clean the cached object when `true`
   * @return {Object} Cached views as a single `{key: value}` object
   */

  value: function (name, flush) {
    var vals = this.cache[name];
    if (flush) this.flush(name);
    return vals;
  },

  /**
   * Clean a named cache.
   * @param  {String} `name` Name of the cached object to clear.
   */

  flush: function (name) {
    this.cache[name] = null;
    return this;
  },

  /**
   * Define a hidden property on this object.
   */

  defineProp: function (name, value) {
    Object.defineProperty(this, name, {
      enumerable: false,
      configurable: true,
      get: function () { return value; },
      set: function (val) { val = value; }
    });
  }
};


/**
 * Simple `Collection` constructor without the complication of the real `Collection` consturctor
 */

function Collection () {}

/**
 * Simple `App` constructor to represent where `Collection` and `CollectionMethods` will be used.
 */

function App () {
  // store view Collections
  this.views = {};
}

/**
 * Simple implementation of `create` that just makes a new `Collection`
 * instance and stores it on `this.views` by name.
 * Applies `CollectionMethods` to the collection instance.
 * Sets up a `this[name]` method that just calls `collectin.set()`
 * Applies `CollectionMethods` to the `this[name]` function
 *
 * @param  {String} `name` Name of the collecton and function to create.
 * @return {Object} `this` to enable chaining
 */

App.prototype.create = function(name) {
  var collection = this.views[name] = new Collection();
  collection.__proto__ = new CollectionMethods(collection);
  this[name] = function (key, value) {
    collection.set(key, value);
  };
  this[name].__proto__ = new CollectionMethods(collection);
  return this;
};

/**
 * Simple `forEach` to be able to check `hasOwnProperty` in example
 */

App.prototype.forEach = function(name, fn) {
  for (var key in this.views[name]) {
    fn(key, this.views[name][key], this.views[name]);
  }
};

var app = new App();
app.create('pages');

// var collection = new Collection();
// collection.__proto__ = CollectionMethods.prototype;

// Add a bunch of `pages` to the `pages` collection
app.pages('a', 'a');
app.pages('b', 'b');
app.pages('c', 'c');
app.pages('d', 'd');
app.pages('e', 'e');

// Let's see how the properties are represented on `app.pages
console.log(app.pages); // [Function]
for(var key in app.pages) {
  // no actual pages are show here
  console.log(key, app.pages.hasOwnProperty(key));
}
console.log();

// Let's see what object is returned by `_views` on `pages` (this could probably be removed)
console.log(app.pages._views); // { a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' }
for(var key in app.pages._views) {
  // all pages and methods are on `app.pages._views` since this is actually a reference to `app.views.pages`
  console.log(key, app.pages._views.hasOwnProperty(key));
}
console.log();

// Let's use the helper method (`pages` ends up being `app.views.pages`
app.forEach('pages', function (key, value, pages) {
  // all pages and methods are on `pages` since it's a reference to `app.views.pages`
  console.log(key, pages.hasOwnProperty(key));
});
console.log();


// do some filtering on the `app.pages` loader function
// notice that the `[Function]` is actually returned to allow chaining
var a = app.pages.filter('a', 'a');
var b = app.pages.filter('b', 'b');
console.log(app.pages); // [Function]
console.log(a, app.pages.value('a')); // [Function] {'a': 'a'}
console.log(a, app.pages.value('a')); // [Function] {'a': 'a'}
console.log(b, app.pages.value('b', true)); // [Function] {'b': 'b'}
console.log(b, app.pages.value('b', true)); // [Function] null ==> cache has been cleared in the previous call because `flush` was `true`
console.log();

// do some filtering on the actual `pages` collection (app.views.pages)
// notice that the `Collection` instance is actually returned to allow chaining (but it hasn't been filtered yet)
var aa = app.views.pages.filter('aa', 'a');
var bb = app.views.pages.filter('bb', 'b');
console.log(app.views.pages); // { a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' }
console.log(aa, app.views.pages.value('aa')); // { a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' } { a: 'a' }
console.log(bb, app.views.pages.value('bb')); // { a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' } { b: 'b' }

