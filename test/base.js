'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var Base = require('../lib/base');

describe('Base', function () {
  it('should create a new instance of Base:', function () {
    var base = new Base();
    assert.equal(base instanceof Base, true);
  });

  it('should contain an `options` property', function () {
    var base = new Base({});
    assert.deepEqual(base.options, {});
    assert.equal(base.hasOwnProperty('options'), true);
  });

  it('should contain an `app` property', function () {
    var base = new Base({app: {}});
    assert.deepEqual(base.app, {});
    assert.equal(base.hasOwnProperty('app'), true);
  });

  it('should contain a `data` property', function () {
    var base = new Base({app: {}});
    assert.deepEqual(base.data, {});
    assert.equal(base.hasOwnProperty('data'), true);
  });

  it('should contain a `_cache` property', function () {
    var base = new Base({app: {}});
    assert.deepEqual(base._cache, {});
    assert.equal(base.hasOwnProperty('_cache'), true);
  });

  it('should cache a function call', function () {
    var base = new Base();
    function foo (bar) {
      return function () {
        return bar;
      };
    };

    var bar1 = base.cache('foo', foo('bar1'));
    var bar2 = base.cache('foo', foo('bar2'));
    assert.equal(bar1, 'bar1');
    assert.equal(bar2, 'bar1');
    assert.equal(bar2, bar1);
  });

  it('should set properties on the object', function () {
    var base = new Base();
    base.set('foo', 'bar');
    assert.equal(base.foo, 'bar');
  });

  it('should get properties from the object', function () {
    var base = new Base();
    base.set('foo', 'bar');
    assert.equal(base.get('foo'), 'bar');
  });

  it('should clone the entire object', function () {
    var base = new Base();
    base.set('foo', 'bar');
    var clone = base.clone();
    assert.equal(clone.get('foo'), base.get('foo'));
    assert.deepEqual(clone, base);
  });

  it('should set an option', function () {
    var base = new Base();
    base.option('foo', 'bar');
    assert.deepEqual(base.options, {foo: 'bar'});
  });

  it('should get an option', function () {
    var base = new Base({foo: 'bar'});
    assert.equal(base.option('foo'), 'bar');
  });

  it('should emit an `option` event when setting an option', function () {
    var base = new Base();
    base.on('option', function (key, val) {
      assert.equal(key, 'foo');
      assert.equal(val, 'bar');
    });
    base.option('foo', 'bar');
  });

  it('should `enable` an option', function () {
    var base = new Base();
    base.enable('foo');
    assert.equal(base.option('foo'), true);
  });

  it('should `disable` an option', function () {
    var base = new Base();
    base.disable('foo');
    assert.equal(base.option('foo'), false);
  });

  it('should check if an option is `enabled`', function () {
    var base = new Base();
    base.enable('foo');
    base.disable('bar');
    assert.equal(base.enabled('foo'), true);
    assert.equal(base.enabled('bar'), false);
  });

  it('should check if an option is `disabled`', function () {
    var base = new Base();
    base.enable('foo');
    base.disable('bar');
    assert.equal(base.disabled('foo'), false);
    assert.equal(base.disabled('bar'), true);
  });

  it('should pick an option from the local `options`', function () {
    var base = new Base({foo: 'bar'});
    assert.equal(base.pickOption('foo'), 'bar');
  });

  it('should pick an option from the `app.options`', function () {
    var app = new Base({foo: 'bar'});
    var base = new Base({app: app});
    assert.equal(base.pickOption('foo'), 'bar');
  });

  it('should `use` a function passing the object and options to the function', function () {
    var base = new Base({foo: 'bar'});
    base.use(function (obj, options) {
      assert.deepEqual(obj, base);
      assert.deepEqual(base.options, options);
      assert.deepEqual(this.options, options);
      assert.deepEqual(this.options, base.options);
    });
  });

  it('should omit keys from object', function () {
    var base = new Base();
    base.set('foo', 'bar');
    base.set('bar', 'baz');
    base.set('baz', 'bang');
    var clone = base.omit(['bar']);
    assert.equal(typeof clone.bar, 'undefined');
    assert.equal(clone.foo, 'bar');
    assert.equal(clone.baz, 'bang');
  });

  it('should pick only the keys from object', function () {
    var base = new Base();
    base.set('foo', 'bar');
    base.set('bar', 'baz');
    base.set('baz', 'bang');
    var clone = base.pick(['bar']);
    assert.equal(clone.bar, 'baz');
    assert.equal(typeof clone.foo, 'undefined');
    assert.equal(typeof clone.baz, 'undefined');
  });

  it('should iterator over `own` keys on object using forOwn', function () {
    var base = new Base();
    base.set('foo', 'bar');
    base.set('bar', 'baz');
    base.set('baz', 'bang');
    var keys = ['foo', 'bar', 'baz'];
    var vals = ['bar', 'baz', 'bang'];
    base.forOwn(function (val, key) {
      var expectedKey = keys.shift();
      var expectedVal = vals.shift();
      assert.equal(key, expectedKey);
      assert.equal(val, expectedVal);
    });
  });

  it('should iterator over all keys on object using forIn', function () {
    var base = new Base();
    base.set('foo', 'bar');
    base.set('bar', 'baz');
    base.set('baz', 'bang');
    var keys = ['foo', 'bar', 'baz'];
    var vals = ['bar', 'baz', 'bang'];
    var len = keys.length + Object.keys(Base.prototype).length;
    var count = 0;
    base.forIn(function (val, key) {
      count++;
    });
    assert.equal(count, len);
  });

  it('should visit all properties on an object and call the specified method', function () {
    var base = new Base();
    var obj = {
      foo: 'bar',
      bar: 'baz',
      baz: 'bang'
    };
    base.visit('set', obj);
    assert.equal(base.get('foo'), 'bar');
    assert.equal(base.get('bar'), 'baz');
    assert.equal(base.get('baz'), 'bang');
  });

  it('should visit all properties on all objects in an array and call the specified method', function () {
    var base = new Base();
    var arr = [
      {foo: 'bar', bar: 'baz', baz: 'bang'},
      {bang: 'boom', boom: 'beep'},
      {beep: 'boop', boop: 'bop'}
    ];
    base.mapVisit('set', arr);
    assert.equal(base.get('foo'), 'bar');
    assert.equal(base.get('bar'), 'baz');
    assert.equal(base.get('baz'), 'bang');
    assert.equal(base.get('bang'), 'boom');
    assert.equal(base.get('boom'), 'beep');
    assert.equal(base.get('beep'), 'boop');
    assert.equal(base.get('boop'), 'bop');
  });

  it('should forward method from Base to another object', function () {
    var base = new Base();
    var obj = {};
    base.forward(obj, ['set', 'get']);
    obj.set('foo', 'bar');
    assert.equal(obj.get('foo'), 'bar');
    assert.equal(base.get('foo'), 'bar');
    assert.equal(base.foo, 'bar');
    assert.equal(obj.foo, null);
  });

  it('should mixin a function by adding it to the Base prototype', function () {
    var base = new Base();
    base.mixin('upper', function (prop) {
      var val = this.get(prop);
      if (typeof val === 'string') {
        return val.toUpperCase();
      }
      return val;
    });
    base.set('foo', 'bar');
    assert.equal(typeof base.upper, 'function');
    assert.equal(base.upper('foo'), 'BAR');

    var base2 = new Base();
    base2.set('bar', 'baz');
    assert.equal(typeof base2.upper, 'function');
    assert.equal(base2.upper('bar'), 'BAZ');
  });
});


