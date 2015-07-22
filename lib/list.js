'use strict';

var util = require('util');

/**
 * Lazily required modules
 */

var lazy = require('lazy-cache')(require);
var async = lazy('async');
var filter = lazy('filter-values');

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
  utils.defineProp(this, 'keyMap', {});
  utils.defineProp(this, 'Item', this.options.Item || require('./item'));
  this.visit('item', this.options.items || {});
  delete this.options.items;
  mixins(this);
}

/**
 * Inherit `Base`
 */

Base.extend(List);

/**
 * Expose `extend`, to allow other classes to inherit
 * from the `List` class.
 *
 * ```js
 * function MyCustomList(options) {...}
 * List.extend(MyCustomList);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `List`
 * @return {undefined}
 * @api public
 */

List.extend = function(Ctor) {
  util.inherits(Ctor, List);
};

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

  item: function(name, obj) {
    var Item = this.get('Item');
    if (typeof obj === 'undefined') {
      return this.items[this.keyMap[name]];
    }

    var item = null;
    if (obj instanceof Item) {
      item = obj;
    } else {
      item = new Item();
      item.visit('set', obj);
    }

    if (!item.key && typeof name === 'string') {
      item.key = name;
    }

    if (typeof name !== 'string') {
      // console.log(name)
    }

    var i = this.keyMap[name];
    if (i >= 0) {
      this.items[i] = item;
    } else {
      this.items.push(item);
      this.keyMap[name] = this.items.length - 1;
    }

    this.emit('item', name, item);
    return item;
  },

  /**
   * Return a list of items, filtered to contain only items that return
   * truthy from the given function.
   *
   * @param  {Function} `fn` Filter function
   * @return {Array}
   * @api public
   */

  filter: function(fn) {
    this.items = filter()(this.items, fn, this);
    return this;
  },

  /**
   * Iterator over each of the items in the list.
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

    async().map(this.items, function (item, next) {
      this.app.render(item, locals, next);
    }.bind(this), cb);
  },
});

/**
 * Expose `List`
 */

module.exports = List;
