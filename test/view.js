'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var Base = require('../lib/base');
var Item = require('../lib/item');
var View = require('../lib/view');

describe('View', function () {
  it('should create a new instance of View:', function () {
    var view = new View(createView(), createOptions());
    assert.equal(view instanceof View, true);
    assert.equal(view instanceof Item, true);
    assert.equal(view instanceof Base, true);
  });

  it('should contain an `options` property', function () {
    var view = new View(createView(), createOptions());
    assert.equal(typeof view.options, 'object');
  });

  it('should contain an `app` property', function () {
    var view = new View(createView(), createOptions());
    assert.equal(typeof view.app === 'object', true);
  });

  it('should contain a `data` property', function () {
    var view = new View(createView(), createOptions());
    assert.deepEqual(view.data, {});
  });

  it('should contain a `_cache` property', function () {
    var view = new View(createView(), createOptions());
    assert.deepEqual(view._cache, {});
  });

  it('fragmentCache should cache a function call', function () {
    var view = new View(createView(), createOptions());
    function foo (bar) {
      return function () {
        return bar;
      };
    };

    var bar1 = view.fragmentCache('foo', foo('bar1'));
    var bar2 = view.fragmentCache('foo', foo('bar2'));
    assert.equal(bar1, 'bar1');
    assert.equal(bar2, 'bar1');
    assert.equal(bar2, bar1);
  });

  it('should set properties on the object', function () {
    var view = new View(createView(), createOptions());
    view.set('foo', 'bar');
    assert.equal(view.foo, 'bar');
  });

  it('should get properties from the object', function () {
    var view = new View(createView(), createOptions());
    view.set('foo', 'bar');
    assert.equal(view.get('foo'), 'bar');
  });

  it('should clone the entire object', function () {
    var view = new View(createView(), createOptions());
    view.set('foo', 'bar');
    var clone = view.clone();
    assert.equal(clone instanceof View, true);
    assert.equal(clone instanceof Base, true);
    assert.equal(clone.get('foo'), view.get('foo'));
    assert.deepEqual(clone, view);
  });

  it('should set an option', function () {
    var view = new View(createView(), createOptions());
    view.option('foo', 'bar');
    assert.deepEqual(view.options.foo, 'bar');
  });

  it('should get an option', function () {
    var view = new View(createView(), createOptions({foo: 'bar'}));
    assert.equal(view.option('foo'), 'bar');
  });

  it('should emit an `option` event when setting an option', function () {
    var view = new View(createView(), createOptions());
    view.on('option', function (key, val) {
      assert.equal(key, 'foo');
      assert.equal(val, 'bar');
    });
    view.option('foo', 'bar');
  });

  it('should `enable` an option', function () {
    var view = new View(createView(), createOptions());
    view.enable('foo');
    assert.equal(view.option('foo'), true);
  });

  it('should `disable` an option', function () {
    var view = new View(createView(), createOptions());
    view.disable('foo');
    assert.equal(view.option('foo'), false);
  });

  it('should check if an option is `enabled`', function () {
    var view = new View(createView(), createOptions());
    view.enable('foo');
    view.disable('bar');
    assert.equal(view.enabled('foo'), true);
    assert.equal(view.enabled('bar'), false);
  });

  it('should check if an option is `disabled`', function () {
    var view = new View(createView(), createOptions());
    view.enable('foo');
    view.disable('bar');
    assert.equal(view.disabled('foo'), false);
    assert.equal(view.disabled('bar'), true);
  });

  it('should pick an option from the local `options`', function () {
    var view = new View(createView(), createOptions({foo: 'bar'}));
    assert.equal(view.pickOption('foo'), 'bar');
  });

  it('should pick an option from the collection `options`', function () {
    var collection = new Base({foo: 'bar'});
    var view = new View(createView(), createOptions({collection: collection}));
    assert.equal(view.pickOption('foo'), 'bar');
  });


  it('should pick an option from the `app.options`', function () {
    var app = createApp(new Base({foo: 'bar'}));
    var view = new View(createView(), createOptions({app: app}));
    assert.equal(view.pickOption('foo'), 'bar');
  });

  it('should pick an option from `app.options` when `collection.options` does not have the option', function () {
    var app = createApp(new Base({foo: 'bar'}));
    var collection = new Base();
    var view = new View(createView(), createOptions({app: app, collection: collection}));
    assert.equal(view.pickOption('foo'), 'bar');
  });

  it('should `use` a function passing the object and options to the function', function () {
    var view = new View(createView(), createOptions({foo: 'bar'}));
    view.use(function (obj, options) {
      assert.deepEqual(obj, view);
      assert.deepEqual(view.options, options);
      assert.deepEqual(this.options, options);
      assert.deepEqual(this.options, view.options);
    });
  });

  it('should omit keys from object', function () {
    var view = new View(createView(), createOptions());
    view.set('foo', 'bar');
    view.set('bar', 'baz');
    view.set('baz', 'bang');
    var clone = view.omit(['bar']);
    assert.equal(typeof clone.bar, 'undefined');
    assert.equal(clone.foo, 'bar');
    assert.equal(clone.baz, 'bang');
  });

  it('should pick only the keys from object', function () {
    var view = new View(createView(), createOptions());
    view.set('foo', 'bar');
    view.set('bar', 'baz');
    view.set('baz', 'bang');
    var clone = view.pick(['bar']);
    assert.equal(clone.bar, 'baz');
    assert.equal(typeof clone.foo, 'undefined');
    assert.equal(typeof clone.baz, 'undefined');
  });

  it('should iterate over `own` keys on object using forOwn', function () {
    var view = new View(createView(), createOptions());
    view.set('foo', 'bar');
    view.set('bar', 'baz');
    view.set('baz', 'bang');
    var keys = ['path', 'content', 'base', 'contexts', 'foo', 'bar', 'baz'];
    var vals = ['foo.hbs', 'foo', process.cwd(), {locals: {}, data: {}}, 'bar', 'baz', 'bang'];
    view.forOwn(function (val, key) {
      var expectedKey = keys.shift();
      var expectedVal = vals.shift();
      assert.equal(key, expectedKey);
      assert.deepEqual(val, expectedVal);
    });
  });

  it('should visit all properties on an object and call the specified method', function () {
    var view = new View(createView(), createOptions());
    var obj = {
      foo: 'bar',
      bar: 'baz',
      baz: 'bang'
    };
    view.visit('set', obj);
    assert.equal(view.get('foo'), 'bar');
    assert.equal(view.get('bar'), 'baz');
    assert.equal(view.get('baz'), 'bang');
  });

  it('should visit all properties on all objects in an array and call the specified method', function () {
    var view = new View(createView(), createOptions());
    var arr = [
      {foo: 'bar', bar: 'baz', baz: 'bang'},
      {bang: 'boom', boom: 'beep'},
      {beep: 'boop', boop: 'bop'}
    ];
    view.visit('set', arr);
    assert.equal(view.get('foo'), 'bar');
    assert.equal(view.get('bar'), 'baz');
    assert.equal(view.get('baz'), 'bang');
    assert.equal(view.get('bang'), 'boom');
    assert.equal(view.get('boom'), 'beep');
    assert.equal(view.get('beep'), 'boop');
    assert.equal(view.get('boop'), 'bop');
  });

  it('should forward method from View to another object', function () {
    var view = new View(createView(), createOptions());
    var obj = {};
    view.forward(obj, ['set', 'get']);
    obj.set('foo', 'bar');
    assert.equal(obj.get('foo'), 'bar');
    assert.equal(view.get('foo'), 'bar');
    assert.equal(view.foo, 'bar');
    assert.equal(obj.foo, null);
  });

  it('should mixin a function by adding it to the View prototype', function () {
    var view = new View(createView(), createOptions());
    view.mixin('upper', function (prop) {
      var val = this.get(prop);
      if (typeof val === 'string') {
        return val.toUpperCase();
      }
      return val;
    });
    view.set('foo', 'bar');
    assert.equal(typeof view.upper, 'function');
    assert.equal(view.upper('foo'), 'BAR');

    var base2 = new View(createView(), createOptions());
    base2.set('bar', 'baz');
    assert.equal(typeof base2.upper, 'function');
    assert.equal(base2.upper('bar'), 'BAZ');
  });

  it('should track changes when `track changes` is enabled', function () {
    var app = createApp(new Base({'track changes': true}));
    var view = new View(createView(), createOptions({app: app}));
    view.mixin('upper', function (prop) {
      this.track('upper', 'Making ' + prop + ' upper case.');
      var val = this.get(prop);
      if (typeof val === 'string') {
        return val.toUpperCase();
      }
      return val;
    });

    var props = ['foo', 'bar'];
    view.set('foo', 'bar');
    view.set('bar', 'baz');
    assert.equal(view.upper('foo'), 'BAR');
    assert.equal(view.upper('bar'), 'BAZ');
    assert.equal(view.options.history.length, 2);
    view.options.history.forEach(function (state) {
      assert.equal(state.tracked.location, 'upper');
      assert.equal(state.tracked.note, 'Making ' + props.shift() + ' upper case.');
    });
  });
});

function noop () {};

function createApp (app) {
  app = app || new Base({});
  app.handleView = noop;
  return app;
}

function createView (view) {
  view = view || {};
  view.path = view.path || 'foo.hbs';
  view.content = view.content || 'foo';
  return view;
}

function createOptions (options) {
  options = options || {};
  options.app = options.app || createApp();
  options.collection = options.collection || new Base({app: options.app, collection: 'foos'});
  return options;
}
