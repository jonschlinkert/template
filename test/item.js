'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var Base = require('../lib/base');
var Item = require('../lib/item');

describe('Item', function () {
  it('should create a new instance of Item:', function () {
    var item = new Item();
    assert.equal(item instanceof Item, true);
    assert.equal(item instanceof Base, true);
  });

  it('should contain an `options` property', function () {
    var item = new Item({});
    assert.deepEqual(item.options, {});
    assert.equal(item.hasOwnProperty('options'), true);
  });

  it('should contain an `app` property', function () {
    var item = new Item({app: {}});
    assert.deepEqual(item.app, {});
    assert.equal(item.hasOwnProperty('app'), true);
  });

  it('should contain a `data` property', function () {
    var item = new Item({app: {}});
    assert.deepEqual(item.data, {});
    assert.equal(item.hasOwnProperty('data'), true);
  });

  it('should contain a `_cache` property', function () {
    var item = new Item({app: {}});
    assert.deepEqual(item._cache, {});
    assert.equal(item.hasOwnProperty('_cache'), true);
  });

  it('should cache a function call', function () {
    var item = new Item();
    function foo (bar) {
      return function () {
        return bar;
      };
    };

    var bar1 = item.cache('foo', foo('bar1'));
    var bar2 = item.cache('foo', foo('bar2'));
    assert.equal(bar1, 'bar1');
    assert.equal(bar2, 'bar1');
    assert.equal(bar2, bar1);
  });

  it('should set properties on the object', function () {
    var item = new Item();
    item.set('foo', 'bar');
    assert.equal(item.foo, 'bar');
  });

  it('should get properties from the object', function () {
    var item = new Item();
    item.set('foo', 'bar');
    assert.equal(item.get('foo'), 'bar');
  });

  it('should clone the entire object', function () {
    var item = new Item();
    item.set('foo', 'bar');
    var clone = item.clone();
    assert.equal(clone instanceof Item, true);
    assert.equal(clone instanceof Base, true);
    assert.equal(clone.get('foo'), item.get('foo'));
    assert.deepEqual(clone, item);
  });

  it('should set an option', function () {
    var item = new Item();
    item.option('foo', 'bar');
    assert.deepEqual(item.options, {foo: 'bar'});
  });

  it('should get an option', function () {
    var item = new Item({foo: 'bar'});
    assert.equal(item.option('foo'), 'bar');
  });

  it('should emit an `option` event when setting an option', function () {
    var item = new Item();
    item.on('option', function (key, val) {
      assert.equal(key, 'foo');
      assert.equal(val, 'bar');
    });
    item.option('foo', 'bar');
  });

  it('should `enable` an option', function () {
    var item = new Item();
    item.enable('foo');
    assert.equal(item.option('foo'), true);
  });

  it('should `disable` an option', function () {
    var item = new Item();
    item.disable('foo');
    assert.equal(item.option('foo'), false);
  });

  it('should check if an option is `enabled`', function () {
    var item = new Item();
    item.enable('foo');
    item.disable('bar');
    assert.equal(item.enabled('foo'), true);
    assert.equal(item.enabled('bar'), false);
  });

  it('should check if an option is `disabled`', function () {
    var item = new Item();
    item.enable('foo');
    item.disable('bar');
    assert.equal(item.disabled('foo'), false);
    assert.equal(item.disabled('bar'), true);
  });

  it('should pick an option from the local `options`', function () {
    var item = new Item({foo: 'bar'});
    assert.equal(item.pickOption('foo'), 'bar');
  });

  it('should pick an option from the collection `options`', function () {
    var collection = new Base({foo: 'bar'});
    var item = new Item({collection: collection});
    assert.equal(item.pickOption('foo'), 'bar');
  });


  it('should pick an option from the `app.options`', function () {
    var app = new Base({foo: 'bar'});
    var item = new Item({app: app});
    assert.equal(item.pickOption('foo'), 'bar');
  });

  it('should pick an option from `app.options` when `collection.options` does not have the option', function () {
    var app = new Base({foo: 'bar'});
    var collection = new Base();
    var item = new Item({app: app, collection: collection});
    assert.equal(item.pickOption('foo'), 'bar');
  });

  it('should `use` a function passing the object and options to the function', function () {
    var item = new Item({foo: 'bar'});
    item.use(function (obj, options) {
      assert.deepEqual(obj, item);
      assert.deepEqual(item.options, options);
      assert.deepEqual(this.options, options);
      assert.deepEqual(this.options, item.options);
    });
  });

  it('should omit keys from object', function () {
    var item = new Item();
    item.set('foo', 'bar');
    item.set('bar', 'baz');
    item.set('baz', 'bang');
    var clone = item.omit(['bar']);
    assert.equal(typeof clone.bar, 'undefined');
    assert.equal(clone.foo, 'bar');
    assert.equal(clone.baz, 'bang');
  });

  it('should pick only the keys from object', function () {
    var item = new Item();
    item.set('foo', 'bar');
    item.set('bar', 'baz');
    item.set('baz', 'bang');
    var clone = item.pick(['bar']);
    assert.equal(clone.bar, 'baz');
    assert.equal(typeof clone.foo, 'undefined');
    assert.equal(typeof clone.baz, 'undefined');
  });

  it('should iterator over `own` keys on object using forOwn', function () {
    var item = new Item();
    item.set('foo', 'bar');
    item.set('bar', 'baz');
    item.set('baz', 'bang');
    var keys = ['foo', 'bar', 'baz'];
    var vals = ['bar', 'baz', 'bang'];
    item.forOwn(function (val, key) {
      var expectedKey = keys.shift();
      var expectedVal = vals.shift();
      assert.equal(key, expectedKey);
      assert.equal(val, expectedVal);
    });
  });

  it('should iterator over all keys on object using forIn', function () {
    var item = new Item();
    item.set('foo', 'bar');
    item.set('bar', 'baz');
    item.set('baz', 'bang');
    var keys = ['foo', 'bar', 'baz'];
    var vals = ['bar', 'baz', 'bang'];
    var len = keys.length
      + Object.keys(Item.prototype).length
      + Object.keys(Base.prototype).length;
    var count = 0;
    item.forIn(function (val, key) {
      count++;
    });
    assert.equal(count, len);
  });

  it('should visit all properties on an object and call the specified method', function () {
    var item = new Item();
    var obj = {
      foo: 'bar',
      bar: 'baz',
      baz: 'bang'
    };
    item.visit('set', obj);
    assert.equal(item.get('foo'), 'bar');
    assert.equal(item.get('bar'), 'baz');
    assert.equal(item.get('baz'), 'bang');
  });

  it('should visit all properties on all objects in an array and call the specified method', function () {
    var item = new Item();
    var arr = [
      {foo: 'bar', bar: 'baz', baz: 'bang'},
      {bang: 'boom', boom: 'beep'},
      {beep: 'boop', boop: 'bop'}
    ];
    item.mapVisit('set', arr);
    assert.equal(item.get('foo'), 'bar');
    assert.equal(item.get('bar'), 'baz');
    assert.equal(item.get('baz'), 'bang');
    assert.equal(item.get('bang'), 'boom');
    assert.equal(item.get('boom'), 'beep');
    assert.equal(item.get('beep'), 'boop');
    assert.equal(item.get('boop'), 'bop');
  });

  it('should forward method from Item to another object', function () {
    var item = new Item();
    var obj = {};
    item.forward(obj, ['set', 'get']);
    obj.set('foo', 'bar');
    assert.equal(obj.get('foo'), 'bar');
    assert.equal(item.get('foo'), 'bar');
    assert.equal(item.foo, 'bar');
    assert.equal(obj.foo, null);
  });

  it('should mixin a function by adding it to the Item prototype', function () {
    var item = new Item();
    item.mixin('upper', function (prop) {
      var val = this.get(prop);
      if (typeof val === 'string') {
        return val.toUpperCase();
      }
      return val;
    });
    item.set('foo', 'bar');
    assert.equal(typeof item.upper, 'function');
    assert.equal(item.upper('foo'), 'BAR');

    var base2 = new Item();
    base2.set('bar', 'baz');
    assert.equal(typeof base2.upper, 'function');
    assert.equal(base2.upper('bar'), 'BAZ');
  });

  it('should track changes when `track changes` is enabled', function () {
    var app = new Base({'track changes': true});
    var item = new Item({app: app});
    item.mixin('upper', function (prop) {
      this.track('upper', 'Making ' + prop + ' upper case.');
      var val = this.get(prop);
      if (typeof val === 'string') {
        return val.toUpperCase();
      }
      return val;
    });

    var props = ['foo', 'bar'];
    item.set('foo', 'bar');
    item.set('bar', 'baz');
    assert.equal(item.upper('foo'), 'BAR');
    assert.equal(item.upper('bar'), 'BAZ');
    assert.equal(item.options.history.length, 2);
    item.options.history.forEach(function (state) {
      assert.equal(state.tracked.location, 'upper');
      assert.equal(state.tracked.note, 'Making ' + props.shift() + ' upper case.');
    });
  });
});


