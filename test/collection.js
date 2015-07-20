'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var forOwn = require('for-own');
var Base = require('../lib/base');
var Item = require('../lib/item');
var List = require('../lib/list');
var Collection = require('../lib/collection');

describe('Collection', function () {
  it('should create a new instance of Collection:', function () {
    var collection = new Collection();
    assert.equal(collection instanceof Base, true);
    assert.equal(collection instanceof Collection, true);
  });

  it('should contain an `options` property', function () {
    var collection = new Collection({});
    assert.deepEqual(collection.options, {});
    assert.equal(collection.hasOwnProperty('options'), true);
  });

  it('should contain an `app` property', function () {
    var collection = new Collection({app: {}});
    assert.deepEqual(collection.app, {});
    assert.equal(collection.hasOwnProperty('app'), true);
  });

  it('should contain a `data` property', function () {
    var collection = new Collection({app: {}});
    assert.deepEqual(collection.data, {});
    assert.equal(collection.hasOwnProperty('data'), true);
  });

  it('should contain a `_cache` property', function () {
    var collection = new Collection({app: {}});
    assert.deepEqual(collection._cache, {});
    assert.equal(collection.hasOwnProperty('_cache'), true);
  });

  it('should cache a function call', function () {
    var collection = new Collection();
    function foo (bar) {
      return function () {
        return bar;
      };
    };

    var bar1 = collection.cache('foo', foo('bar1'));
    var bar2 = collection.cache('foo', foo('bar2'));
    assert.equal(bar1, 'bar1');
    assert.equal(bar2, 'bar1');
    assert.equal(bar2, bar1);
  });

  it('should set properties on the object', function () {
    var collection = new Collection();
    collection.set('foo', 'bar');
    assert.equal(collection.foo, 'bar');
  });

  it('should get properties from the object', function () {
    var collection = new Collection();
    collection.set('foo', 'bar');
    assert.equal(collection.get('foo'), 'bar');
  });

  it('should clone the entire object', function () {
    var collection = new Collection();
    collection.set('foo', 'bar');
    var clone = collection.clone();
    assert.equal(clone.get('foo'), collection.get('foo'));
    assert.deepEqual(clone, collection);
  });

  it('should set an option', function () {
    var collection = new Collection();
    collection.option('foo', 'bar');
    assert.deepEqual(collection.options, {foo: 'bar'});
  });

  it('should get an option', function () {
    var collection = new Collection({foo: 'bar'});
    assert.equal(collection.option('foo'), 'bar');
  });

  it('should emit an `option` event when setting an option', function () {
    var collection = new Collection();
    collection.on('option', function (key, val) {
      assert.equal(key, 'foo');
      assert.equal(val, 'bar');
    });
    collection.option('foo', 'bar');
  });

  it('should `enable` an option', function () {
    var collection = new Collection();
    collection.enable('foo');
    assert.equal(collection.option('foo'), true);
  });

  it('should `disable` an option', function () {
    var collection = new Collection();
    collection.disable('foo');
    assert.equal(collection.option('foo'), false);
  });

  it('should check if an option is `enabled`', function () {
    var collection = new Collection();
    collection.enable('foo');
    collection.disable('bar');
    assert.equal(collection.enabled('foo'), true);
    assert.equal(collection.enabled('bar'), false);
  });

  it('should check if an option is `disabled`', function () {
    var collection = new Collection();
    collection.enable('foo');
    collection.disable('bar');
    assert.equal(collection.disabled('foo'), false);
    assert.equal(collection.disabled('bar'), true);
  });

  it('should pick an option from the local `options`', function () {
    var collection = new Collection({foo: 'bar'});
    assert.equal(collection.pickOption('foo'), 'bar');
  });

  it('should pick an option from the `app.options`', function () {
    var app = new Collection({foo: 'bar'});
    var collection = new Collection({app: app});
    assert.equal(collection.pickOption('foo'), 'bar');
  });

  it('should `use` a function passing the object and options to the function', function () {
    var collection = new Collection({foo: 'bar'});
    collection.use(function (obj, options) {
      assert.deepEqual(obj, collection);
      assert.deepEqual(collection.options, options);
      assert.deepEqual(this.options, options);
      assert.deepEqual(this.options, collection.options);
    });
  });

  it('should omit keys from object', function () {
    var collection = new Collection();
    collection.set('foo', 'bar');
    collection.set('bar', 'baz');
    collection.set('baz', 'bang');
    var clone = collection.omit(['bar']);
    assert.equal(typeof clone.bar, 'undefined');
    assert.equal(clone.foo, 'bar');
    assert.equal(clone.baz, 'bang');
  });

  it('should pick only the keys from object', function () {
    var collection = new Collection();
    collection.set('foo', 'bar');
    collection.set('bar', 'baz');
    collection.set('baz', 'bang');
    var clone = collection.pick(['bar']);
    assert.equal(clone.bar, 'baz');
    assert.equal(typeof clone.foo, 'undefined');
    assert.equal(typeof clone.baz, 'undefined');
  });

  it('should iterator over `own` keys on object using forOwn', function () {
    var collection = new Collection();
    collection.set('foo', 'bar');
    collection.set('bar', 'baz');
    collection.set('baz', 'bang');
    var keys = ['foo', 'bar', 'baz'];
    var vals = ['bar', 'baz', 'bang'];
    collection.forOwn(function (val, key) {
      var expectedKey = keys.shift();
      var expectedVal = vals.shift();
      assert.equal(key, expectedKey);
      assert.equal(val, expectedVal);
    });
  });

  it('should iterator over all keys on object using forIn', function () {
    var collection = new Collection();
    collection.set('foo', 'bar');
    collection.set('bar', 'baz');
    collection.set('baz', 'bang');
    var keys = ['foo', 'bar', 'baz'];
    var len = keys.length
      + Object.keys(Collection.prototype).length
      + Object.keys(Base.prototype).length;

    var count = 0;
    collection.forIn(function (val, key) {
      count++;
    });
    assert.equal(count, len);
  });

  it('should visit all properties on an object and call the specified method', function () {
    var collection = new Collection();
    var obj = {
      foo: 'bar',
      bar: 'baz',
      baz: 'bang'
    };
    collection.visit('set', obj);
    assert.equal(collection.get('foo'), 'bar');
    assert.equal(collection.get('bar'), 'baz');
    assert.equal(collection.get('baz'), 'bang');
  });

  it('should visit all properties on all objects in an array and call the specified method', function () {
    var collection = new Collection();
    var arr = [
      {foo: 'bar', bar: 'baz', baz: 'bang'},
      {bang: 'boom', boom: 'beep'},
      {beep: 'boop', boop: 'bop'}
    ];
    collection.mapVisit('set', arr);
    assert.equal(collection.get('foo'), 'bar');
    assert.equal(collection.get('bar'), 'baz');
    assert.equal(collection.get('baz'), 'bang');
    assert.equal(collection.get('bang'), 'boom');
    assert.equal(collection.get('boom'), 'beep');
    assert.equal(collection.get('beep'), 'boop');
    assert.equal(collection.get('boop'), 'bop');
  });

  it('should forward method from Collection to another object', function () {
    var collection = new Collection();
    var obj = {};
    collection.forward(obj, ['set', 'get']);
    obj.set('foo', 'bar');
    assert.equal(obj.get('foo'), 'bar');
    assert.equal(collection.get('foo'), 'bar');
    assert.equal(collection.foo, 'bar');
    assert.equal(obj.foo, null);
  });

  it('should mixin a function by adding it to the Collection prototype', function () {
    var collection = new Collection();
    collection.mixin('upper', function (prop) {
      var val = this.get(prop);
      if (typeof val === 'string') {
        return val.toUpperCase();
      }
      return val;
    });
    collection.set('foo', 'bar');
    assert.equal(typeof collection.upper, 'function');
    assert.equal(collection.upper('foo'), 'BAR');

    var base2 = new Collection();
    base2.set('bar', 'baz');
    assert.equal(typeof base2.upper, 'function');
    assert.equal(base2.upper('bar'), 'BAZ');
  });

  it('should wrap a function', function () {
    var collection = new Collection();
    var fn = collection.wrap({foo: 'bar'}, function (col, opts) {
      assert.equal(col instanceof Collection, true);
      assert.deepEqual(col, collection);
      assert.deepEqual(opts, {foo: 'bar'});
    });
  });

  it('should get the current items on the collection', function () {
    var collection = new Collection();
    collection.set('foo', createItem({name: 'foo', content: 'foo'}, {collection: collection}));
    collection.set('bar', createItem({name: 'bar', content: 'bar'}, {collection: collection}));
    collection.set('baz', createItem({name: 'baz', content: 'baz'}, {collection: collection}));
    collection.set('bang', createItem({name: 'bang', content: 'bang'}, {collection: collection}));
    var items = collection.items;
    assert.deepEqual(Object.keys(items), ['foo', 'bar', 'baz', 'bang']);
    forOwn(items, function (item, key) {
      assert.deepEqual(item, collection.get(key));
    });
  });

  it('should set the items on the collection', function () {
    var collection = new Collection();
    var items = {};
    items.foo = createItem({name: 'foo', content: 'foo'}, {collection: collection});
    items.bar = createItem({name: 'bar', content: 'bar'}, {collection: collection});
    items.baz = createItem({name: 'baz', content: 'baz'}, {collection: collection});
    items.bang = createItem({name: 'bang', content: 'bang'}, {collection: collection});
    collection.items = items;
    assert.deepEqual(Object.keys(items), ['foo', 'bar', 'baz', 'bang']);
    assert.deepEqual(Object.keys(collection), ['foo', 'bar', 'baz', 'bang']);
    forOwn(items, function (item, key) {
      assert.deepEqual(item, collection.get(key));
    });
  });

  it('should sort the items by the key', function () {
    var collection = new Collection();
    collection.set('foo', createItem({name: 'foo', content: 'foo'}, {collection: collection}));
    collection.set('bar', createItem({name: 'bar', content: 'bar'}, {collection: collection}));
    collection.set('baz', createItem({name: 'baz', content: 'baz'}, {collection: collection}));
    collection.set('bang', createItem({name: 'bang', content: 'bang'}, {collection: collection}));
    assert.deepEqual(Object.keys(collection), ['foo', 'bar', 'baz', 'bang']);
    collection.sortBy();
    assert.deepEqual(Object.keys(collection), ['bang', 'bar', 'baz', 'foo']);
  });

  it('should sort the items a property', function () {
    var collection = new Collection();
    collection.set('foo', createItem({name: 'a-foo', content: 'foo'}, {collection: collection}));
    collection.set('bar', createItem({name: 'y-bar', content: 'bar'}, {collection: collection}));
    collection.set('baz', createItem({name: 'x-baz', content: 'baz'}, {collection: collection}));
    collection.set('bang', createItem({name: 'w-bang', content: 'bang'}, {collection: collection}));
    assert.deepEqual(Object.keys(collection), ['foo', 'bar', 'baz', 'bang']);
    collection.sortBy('name');
    assert.deepEqual(Object.keys(collection), ['foo', 'bang', 'baz', 'bar']);
  });

  it('should be chainable', function () {
    var collection = new Collection();
    collection.set('foo', createItem({name: 'a-foo', order: '20', content: 'foo'}, {collection: collection}));
    collection.set('bar', createItem({name: 'y-bar', order: '10', content: 'bar'}, {collection: collection}));
    collection.set('baz', createItem({name: 'x-baz', order: '30', content: 'baz'}, {collection: collection}));
    collection.set('bang', createItem({name: 'w-bang', order: '40', content: 'bang'}, {collection: collection}));
    assert.deepEqual(Object.keys(collection), ['foo', 'bar', 'baz', 'bang']);
    collection
      .sortBy('name')
      .sortBy('order');
    assert.deepEqual(Object.keys(collection), ['bar', 'foo', 'baz', 'bang']);
  });

  it('should get recent items returned as a List', function () {
    var collection = new Collection();
    collection.set('post-1', createItem({date: '2015-01-05', name: 'Post 1', content: 'Post 1'}, {collection: collection}));
    collection.set('post-2', createItem({date: '2015-02-05', name: 'Post 2', content: 'Post 2'}, {collection: collection}));
    collection.set('post-3', createItem({date: '2015-03-05', name: 'Post 3', content: 'Post 3'}, {collection: collection}));
    collection.set('post-4', createItem({date: '2015-04-05', name: 'Post 4', content: 'Post 4'}, {collection: collection}));
    collection.set('post-5', createItem({date: '2015-05-05', name: 'Post 5', content: 'Post 5'}, {collection: collection}));
    collection.set('post-6', createItem({date: '2015-06-05', name: 'Post 6', content: 'Post 6'}, {collection: collection}));
    collection.set('post-7', createItem({date: '2015-07-05', name: 'Post 7', content: 'Post 7'}, {collection: collection}));
    var recent = collection.recent('date', null, {limit: 3});
    assert.equal(recent instanceof List, true);
    assert.equal(recent.items.length, 3);
    assert.deepEqual(recent.items, [
      {date: '2015-07-05', name: 'Post 7', content: 'Post 7', key: 'post-7'},
      {date: '2015-06-05', name: 'Post 6', content: 'Post 6', key: 'post-6'},
      {date: '2015-05-05', name: 'Post 5', content: 'Post 5', key: 'post-5'},
    ]);

    recent.forEach(function (post) {
      assert.deepEqual(post, collection.get(post.key));
    });
  });
});

function createItem(obj, options) {
  var item = new Item(options);
  item.visit('set', obj);
  return item;
}
