'use strict';

var util = require('util');
var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('extend-shallow', 'extend');
lazy('filter-values', 'filter');
lazy('async-each', 'each');

/**
 * Local modules
 */

var mixins = require('./mixins/list');
var utils = require('./utils');
var Base = require('./base');

/**
 * Create an instance of `List` with the given options. Lists are
 * arrayified collections, with items that can be sorted, filtered,
 * grouped, and paginated. The `List` constructor inherits from Base.
 *
 * ```js
 * var list = new List();
 * ```
 *
 * @param {Object} `options` `List` options (passed to `Base`)
 * @return {undefined}
 * @api public
 */

function List(options) {
  Base.call(this, options || {});
  this.items = [];
  this.define('keyMap', {});
  this.define('Item', this.options.Item || require('./item'));
  this.visit('item', this.options.items || {});
  delete this.options.items;
  mixins(this);
}

/**
 * Inherit `Base`
 */

Base.extend(List);

/**
 * `List` prototype methods
 */

utils.delegate(List.prototype, {
  constructor: List,

  /**
   * Get or Add an item to the list. Creates a new instance of `Item` when
   * adding.
   *
   * ```js
   * var list = new List();
   * list.item('foo', {name: 'foo'});
   * console.log(list.items);
   * //=> [{name: 'foo'}]
   * ```
   *
   * @param  {String} `name` Name of the item to get or add.
   * @param  {Object} `obj` Optional item to add or update.
   * @return {Object} `item`
   * @api public
   */

  item: function(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError('item key must be a string.');
    }
    if (typeof value === 'undefined') {
      return this.getItem(key);
    }
    this.addItem(key, value);
    return value;
  },

  /**
   * Add a new item or update an existing item.
   *
   * ```js
   * list.addItem('foo', {contents: '...'});
   * ```
   *
   * @param {String} `key`
   * @param {Object} `value`
   * @api public
   */

  addItem: function (key, value) {
    var Item = this.get('Item');

    if (!(value instanceof Item)) {
      value = new Item(value);
    }

    value.key = value.key || key;
    var i = this.indexOf(key);

    if (i !== -1) {
      this.items[i] = value;
    } else {
      this.items.push(value);
      this.keyMap[key] = this.items.length - 1;
    }

    this.emit('item', key, value);
    return this;
  },

  /**
   * Get an item from the list.
   *
   * ```js
   * list.getItem('foo');
   * //=> {key: 'foo', contents: '...'}
   * ```
   * @param  {String} `key`
   * @return {Object}
   * @api public
   */

  getItem: function (key) {
    return this.items[this.indexOf(key)];
  },

  /**
   * Get the index of an item, or `-1` if it doesn't exist.
   *
   * @param  {String} `key`
   * @return {Number} The index of the item.
   * @api public
   */

  indexOf: function (key) {
    var idx = this.keyMap[key];
    return typeof idx === 'number' ? idx : -1;
  },

  /**
   * Return a list of items, filtered to contain only items that return
   * truthy from the filter function.
   *
   * @param  {Function} `fn` Filter function
   * @return {Array}
   * @api public
   */

  filter: function(fn) {
    this.items = lazy.filter(this.items, fn, this);
    return this;
  },

  /**
   * Iterate over the array of items in the list.
   *
   * ```js
   * list.forEach(function (item) {
   *   console.log(item);
   * });
   * ```
   *
   * @param  {Function} `fn` Function called and passed each item.
   * @return {Object} Returns current instance for chaining
   * @api public
   */

  forEach: function (fn) {
    this.items.forEach(fn.bind(this));
    return this;
  },

  /**
   * Render all items in the list and return an array in the callback.
   *
   * @param  {Object} `locals`
   * @param  {Function} `fn`
   * @return {Object}
   * @api public
   */

  render: function (locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    lazy.each(this.items, function (item, next) {
      this.app.render(item, locals, next);
    }.bind(this), cb);
  },
});

/**
 * Expose `extend`, to allow other classes to inherit
 * from the `List` class.
 *
 * ```js
 * function MyList(options) {...}
 * List.extend(MyList);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `List`
 * @return {undefined}
 * @api public
 */

List.extend = function(Ctor) {
  util.inherits(Ctor, List);
  lazy.extend(Ctor, List);
};

/**
 * Expose `List`
 */

module.exports = List;
