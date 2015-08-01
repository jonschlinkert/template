'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var forOwn = require('for-own');
var Base = require('../lib/base');
var Item = require('../lib/item');
var View = require('../lib/view');
var List = require('../lib/list');
var Views = require('../lib/views');

describe('Views', function () {
  it('should create a new instance of Views:', function () {
    var views = new Views(createOptions());
    assert.equal(views instanceof Base, true);
    assert.equal(views instanceof Views, true);
  });

  it('should contain an `options` property', function () {
    var views = new Views(createOptions());
    assert.equal(views.hasOwnProperty('options'), true);
  });

  it('should contain an `app` property', function () {
    var views = new Views(createOptions());
    assert.equal(views.hasOwnProperty('app'), true);
  });

  it('should contain a `data` property', function () {
    var views = new Views(createOptions());
    assert.deepEqual(views.data, {});
    assert.equal(views.hasOwnProperty('data'), true);
  });

  it('should contain a `_cache` property', function () {
    var views = new Views(createOptions());
    assert.deepEqual(views._cache, {});
    assert.equal(views.hasOwnProperty('_cache'), true);
  });

  it('fragmentCache should cache a function call', function () {
    var views = new Views(createOptions());
    function foo (bar) {
      return function () {
        return bar;
      };
    };

    var bar1 = views.fragmentCache('foo', foo('bar1'));
    var bar2 = views.fragmentCache('foo', foo('bar2'));
    assert.equal(bar1, 'bar1');
    assert.equal(bar2, 'bar1');
    assert.equal(bar2, bar1);
  });

  it('should set properties on the object', function () {
    var views = new Views(createOptions());
    views.set('foo', createView({path: 'bar'}));
    assert.equal(views.foo.path, 'bar');
  });

  it('should get properties from the object', function () {
    var views = new Views(createOptions());
    views.set('foo', createView({path: 'bar'}));
    assert.equal(views.get('foo').path, 'bar');
  });

  it('should clone the entire object', function () {
    var views = new Views(createOptions());
    views.set('foo', createView({path: 'bar'}));
    var clone = views.clone();
    assert.deepEqual(clone.get('foo'), views.get('foo'));
    assert.deepEqual(clone, views);
  });

  it('should set an option', function () {
    var views = new Views(createOptions());
    views.option('foo', 'bar');
    views.options.should.have.property('foo', 'bar');
  });

  it('should get an option', function () {
    var views = new Views(createOptions({foo: 'bar'}));
    assert.equal(views.option('foo'), 'bar');
  });

  it('should emit an `option` event when setting an option', function () {
    var views = new Views(createOptions());
    views.on('option', function (key, val) {
      assert.equal(key, 'foo');
      assert.equal(val, 'bar');
    });
    views.option('foo', 'bar');
  });

  it('should `enable` an option', function () {
    var views = new Views(createOptions());
    views.enable('foo');
    assert.equal(views.option('foo'), true);
  });

  it('should `disable` an option', function () {
    var views = new Views(createOptions());
    views.disable('foo');
    assert.equal(views.option('foo'), false);
  });

  it('should check if an option is `enabled`', function () {
    var views = new Views(createOptions());
    views.enable('foo');
    views.disable('bar');
    assert.equal(views.enabled('foo'), true);
    assert.equal(views.enabled('bar'), false);
  });

  it('should check if an option is `disabled`', function () {
    var views = new Views(createOptions());
    views.enable('foo');
    views.disable('bar');
    assert.equal(views.disabled('foo'), false);
    assert.equal(views.disabled('bar'), true);
  });

  it('should pick an option from the local `options`', function () {
    var views = new Views(createOptions({foo: 'bar'}));
    assert.equal(views.pickOption('foo'), 'bar');
  });

  it('should pick an option from the `app.options`', function () {
    var app = new Views(createOptions({foo: 'bar'}));
    var views = new Views({app: app});
    assert.equal(views.pickOption('foo'), 'bar');
  });

  it('should `use` a function, exposing the views object and options to the function', function () {
    var views = new Views(createOptions({foo: 'bar'}));
    views.use(function (obj, options) {
      assert.deepEqual(obj, views);
      assert.deepEqual(views.options, options);
      assert.deepEqual(this.options, options);
      assert.deepEqual(this.options, views.options);
    });
  });

  it('should omit keys from object', function () {
    var views = new Views({});
    views.set('foo', 'bar');
    views.set('bar', 'baz');
    views.set('baz', 'bang');
    var clone = views.omit(['bar']);
    assert.equal(typeof clone.bar, 'undefined');
    assert.equal(clone.foo, 'bar');
    assert.equal(clone.baz, 'bang');
  });

  it('should pick only the keys from object', function () {
    var views = new Views(createOptions());
    views.set('foo', 'bar');
    views.set('bar', 'baz');
    views.set('baz', 'bang');
    var clone = views.pick(['bar']);
    assert.equal(clone.bar, 'baz');
    assert.equal(typeof clone.foo, 'undefined');
    assert.equal(typeof clone.baz, 'undefined');
  });

  it('should iterator over `own` keys on object using forOwn', function () {
    var views = new Views(createOptions());
    views.set('foo', 'bar');
    views.set('bar', 'baz');
    views.set('baz', 'bang');
    var keys = ['foo', 'bar', 'baz'];
    var vals = ['bar', 'baz', 'bang'];
    views.forOwn(function (val, key) {
      var expectedKey = keys.shift();
      var expectedVal = vals.shift();
      assert.equal(key, expectedKey);
      assert.equal(val, expectedVal);
    });
  });

  it('should iterate over all keys on object using forIn', function () {
    var views = new Views(createOptions());
    views.set('foo', 'bar');
    views.set('bar', 'baz');
    views.set('baz', 'bang');
    var keys = ['foo', 'bar', 'baz'];
    var len = keys.length
      + Object.keys(Views.prototype).length
      + Object.keys(Base.prototype).length;

    var count = 0;
    views.forIn(function (val, key) {
      count++;
    });
    assert.equal(count, len);
  });

  it('should visit all properties on all objects in an array and call the specified method', function () {
    var views = new Views(createOptions());
    var arr = [
      {a: createView({path: 'a'})},
      {b: createView({path: 'b'})},
      {c: createView({path: 'c'})},
    ];
    views.visit('set', arr);
    assert.equal(views.get('a').path, 'a');
    assert.equal(views.get('b').path, 'b');
    assert.equal(views.get('c').path, 'c');
  });

  it('should forward method from Views to another object', function () {
    var views = new Views(createOptions());
    var obj = {};
    views.forward(obj, ['set', 'get']);
    obj.set('foo', createView({path: 'bar'}));
    assert.equal(obj.get('foo').path, 'bar');
    assert.equal(views.get('foo').path, 'bar');
    assert.equal(views.foo.path, 'bar');
    assert.equal(obj.foo, null);
  });

  it('should mixin a function by adding it to the Views prototype', function () {
    var views = new Views(createOptions());
    views.mixin('upper', function (prop) {
      var val = this.get(prop);
      if (typeof val === 'string') {
        return val.toUpperCase();
      }
      return val;
    });
    views.set('foo', createView({path: 'bar'}));
    assert.equal(typeof views.upper, 'function');
    assert.equal(views.upper('foo.path'), 'BAR');
  });

  it('should wrap a function', function () {
    var views = new Views(createOptions());
    var fn = views.wrap({foo: 'bar'}, function (col, opts) {
      assert.equal(col instanceof Views, true);
      assert.deepEqual(col, views);
      assert.deepEqual(opts, {foo: 'bar'});
    });
  });

  it('should get the current items on the views', function () {
    var views = new Views(createOptions());
    views.set('foo', createView({path: 'foo', content: 'foo'}, {collection: views}));
    views.set('bar', createView({path: 'bar', content: 'bar'}, {collection: views}));
    views.set('baz', createView({path: 'baz', content: 'baz'}, {collection: views}));
    views.set('bang', createView({path: 'bang', content: 'bang'}, {collection: views}));
    var items = views.items;
    assert.deepEqual(Object.keys(items), ['foo', 'bar', 'baz', 'bang']);
    forOwn(items, function (item, key) {
      assert.deepEqual(item, views.get(key));
    });
  });

  it('should set the items on the views', function () {
    var views = new Views(createOptions());
    var items = {};
    items.foo = createView({path: 'foo', content: 'foo'}, {collection: views});
    items.bar = createView({path: 'bar', content: 'bar'}, {collection: views});
    items.baz = createView({path: 'baz', content: 'baz'}, {collection: views});
    items.bang = createView({path: 'bang', content: 'bang'}, {collection: views});
    views.items = items;
    assert.deepEqual(Object.keys(items), ['foo', 'bar', 'baz', 'bang']);
    assert.deepEqual(Object.keys(views), ['foo', 'bar', 'baz', 'bang']);
    forOwn(items, function (item, key) {
      assert.deepEqual(item, views.get(key));
    });
  });

  it('should sort the items by the key', function () {
    var views = new Views(createOptions());
    views.set('foo', createView({path: 'foo', content: 'foo'}, {collection: views}));
    views.set('bar', createView({path: 'bar', content: 'bar'}, {collection: views}));
    views.set('baz', createView({path: 'baz', content: 'baz'}, {collection: views}));
    views.set('bang', createView({path: 'bang', content: 'bang'}, {collection: views}));

    Object.keys(views).should.eql(['foo', 'bar', 'baz', 'bang']);
    views.sortBy();
    Object.keys(views).should.eql(['bang', 'bar', 'baz', 'foo']);
  });

  it('should sort the items by a property', function () {
    var views = new Views(createOptions());
    views.set('foo', createView({name: 'a-foo', path: 'a-foo.hbs', content: 'foo'}, {collection: views}));
    views.set('bar', createView({name: 'y-bar', path: 'y-bar.hbs', content: 'bar'}, {collection: views}));
    views.set('baz', createView({name: 'x-baz', path: 'x-baz.hbs', content: 'baz'}, {collection: views}));
    views.set('bang', createView({name: 'w-bang', path: 'w-bang.hbs', content: 'bang'}, {collection: views}));
    Object.keys(views).should.eql(['foo', 'bar', 'baz', 'bang']);

    views.sortBy('name');
    Object.keys(views).should.eql(['foo', 'bang', 'baz', 'bar']);
  });

  it('should be chainable', function () {
    var views = new Views(createOptions());
    views.set('foo', createView({path: 'a-foo', order: '20', content: 'foo'}, {collection: views}));
    views.set('bar', createView({path: 'y-bar', order: '10', content: 'bar'}, {collection: views}));
    views.set('baz', createView({path: 'x-baz', order: '30', content: 'baz'}, {collection: views}));
    views.set('bang', createView({path: 'w-bang', order: '40', content: 'bang'}, {collection: views}));
    assert.deepEqual(Object.keys(views), ['foo', 'bar', 'baz', 'bang']);
    views
      .sortBy('name')
      .sortBy('order');

    views.should.have.properties(['bar', 'foo', 'baz', 'bang']);
  });

  it('should get recent items returned as a List', function () {
    var views = new Views(createOptions());
    views.set('post-1', createView({date: '2015-01-05', path: 'Post 1', content: 'Post 1'}, {collection: views}));
    views.set('post-2', createView({date: '2015-02-05', path: 'Post 2', content: 'Post 2'}, {collection: views}));
    views.set('post-3', createView({date: '2015-03-05', path: 'Post 3', content: 'Post 3'}, {collection: views}));
    views.set('post-4', createView({date: '2015-04-05', path: 'Post 4', content: 'Post 4'}, {collection: views}));
    views.set('post-5', createView({date: '2015-05-05', path: 'Post 5', content: 'Post 5'}, {collection: views}));
    views.set('post-6', createView({date: '2015-06-05', path: 'Post 6', content: 'Post 6'}, {collection: views}));
    views.set('post-7', createView({date: '2015-07-05', path: 'Post 7', content: 'Post 7'}, {collection: views}));
    var recent = views.recent('date', null, {limit: 3});
    assert.equal(recent instanceof List, true);
    assert.equal(recent.items.length, 3);

    recent.items.forEach(function (item) {
      item.should.have.properties(['content', 'context']);
    });

    recent.forEach(function (post) {
      assert.deepEqual(post, views.get(post.key));
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
