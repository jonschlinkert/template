/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Template = require('..');

describe('Template', function () {
  describe('constructor:', function () {
    it('when new Template() is defined:', function () {
      var template = new Template({
        one: 1,
        two: 2
      });
      template.get('one').should.eql(1);
      template.get('two').should.eql(2);
      template.should.be.instanceOf(Template);
    });
  });

  describe('keys():', function () {
    var template = new Template();
    it('should return the keys of properties on the cache.', function () {
      template.clear();

      template.set('a', 1);
      template.set('b', 2);
      template.set('c', 3);
      template.keys().should.eql(['a', 'b', 'c']);
    });
  });

  describe('get/set:', function () {
    var template = new Template();

    afterEach(function() {
      template.clear();
    });

    describe('set() - add:', function () {
      it('should set a new property with the given value', function () {
        template.set('one', 1);
        template.get('one').should.eql(1);
      });
    });

    describe('set() - update:', function () {
      it('should update an existing property with the given value', function () {
        template.set('one', 2);
        template.get('one').should.eql(2);
      });

      it('should get the given property', function () {
        template.set('a', 'b');
        template.get('a').should.eql('b');
      });
    });
  });

  describe('get():', function () {
    var template = new Template();
    var obj = {a: {b: {c: 1, d: '', e: null, f: undefined, 'g.h.i': 2}}};
    template.merge(obj);

    it('should get immediate properties.', function() {
      template.get('a').should.eql(obj.a);
    });
    it('should get nested properties.', function() {
      template.get('a.b').should.eql(obj.a.b);
    });
    it('should return undefined for nonexistent properties.', function() {
      (typeof template.get('a.x')).should.be.undefined;
    });
    it('should return values.', function() {
      template.get('a.b.c').should.eql(1);
    });
    it('should return values.', function() {
      template.get('a.b.d').should.eql('');
    });
    it('should return values.', function() {
      (typeof template.get('a.b.e')).should.be.an.object;
      // template.get('a.b.e').should.equal.null;
    });
    it('should return values.', function() {
      (typeof template.get('a.b.f')).should.be.undefined;
    });
    it('literal backslash should escape period in property name.', function() {
      template.get('a.b.g\\.h\\.i').should.equal(2);
    });
    it('should just return existing properties.', function() {
      template.get('a', true).should.eql(template.cache.a);
    });
    it('should create immediate properties.', function() {
      template.get('b', true).should.eql(template.cache.b);
    });
    it('should create nested properties.', function() {
      template.get('c.d.e', true).should.eql(template.cache.c.d.e);
    });
  });

  describe('all:', function () {
    var template = new Template();

    it('should list the entire cache', function () {
      template.get().should.eql(template.cache);
    });
  });

  describe('set()/get():', function () {
    var template = new Template();
    it('should return immediate property value.', function() {
      template.set('a', 1);
      template.get('a').should.eql(1)
    });
    it('should set property value.', function() {
      template.cache.a.should.eql(1);
    });
    it('should return nested property value.', function() {
      template.set('b.c.d', 1);
      template.get('b.c.d').should.eql(1);
    });
    it('should set property value.', function() {
      template.cache.b.c.d.should.eql(1);
    });
    it('literal backslash should escape period in property name.', function() {
      template.set('e\\.f\\.g', 1);
      template.get('e\\.f\\.g').should.eql(1);
      template.cache['e.f.g'].should.eql(1);
    });
  });

  describe('exists():', function () {
    var template = new Template();
    var obj = {a: {b: {c: 1, d: '', e: null, f: undefined, 'g.h.i': 2}}};

    template.merge(obj);

    it('immediate property should exist.', function() {
      template.exists('a').should.be.ok;
    });
    it('nested property should exist.', function() {
      template.exists('a.b').should.be.ok;
    });
    it('nested property should exist.', function() {
      template.exists('a.b.c').should.be.ok;
    });
    it('nested property should exist.', function() {
      template.exists('a.b.d').should.be.ok;
    });
    it('nested property should exist.', function() {
      template.exists('a.b.e').should.be.ok;
    });
    it('nested property should exist.', function() {
      template.exists('a.b.f').should.be.ok;
    });
    it('literal backslash should escape period in property name.', function() {
      template.exists('a.b.g\\.h\\.i').should.be.ok;
    });
    it('nonexistent property should not exist.', function() {
      template.exists('x').should.eql(false);
    });
    it('nonexistent property should not exist.', function() {
      template.exists('a.x').should.eql(false);
    });
    it('nonexistent property should not exist.', function() {
      template.exists('a.b.x').should.eql(false);
    });
  });

  describe('events:', function () {
    describe('when configuration settings are customized', function () {
      it('should have the custom settings', function () {
        var template = new Template();
        template.wildcard.should.be.true;
        template.listenerTree.should.be.an.object;
      });
    });

    describe('when a listener is removed', function () {
      it('should remove listener', function () {
        var template = new Template();
        var called = false;
        var type = 'foo', listeners;
        var fn = function () {};

        // add
        template.on(type, fn);
        listeners = template.listeners(type);
        listeners.length.should.equal(1);

        // remove
        template.removeListener(type, fn);
        listeners = template.listeners(type);
        listeners.length.should.equal(0);
      });
    });

    describe('when listeners are added', function () {
      it('should add the listeners', function () {
        var template = new Template();
        var called = false;
        template.on('foo', function () {
          called = 'a';
        });
        template.emit('foo');
        called.should.equal('a');
        template.on('foo', function () {
          called = 'b';
        });
        template.emit('foo');
        called.should.equal('b');
        template.on('foo', function () {
          called = true;
        });
        template.emit('foo');
        called.should.equal(true);
        template.listeners('foo').length.should.equal(3);
      });

      it('should emit `set` when a value is set', function () {
        var called = false;
        var value = '';
        var template = new Template();
        template.on('set', function (key, val) {
          called = key;
          value = val;
        });
        template.set('foo', 'bar');
        called.should.equal('foo');
        value.should.equal('bar');
      });

      it('should emit `set` when items are set on the template.', function () {
        var called = false;
        var template = new Template();

        template.on('set', function (key, value) {
          called = true;
          template.exists(key).should.be.true;
        });

        template.set('one', 'a');
        template.set('two', 'c');
        template.set('one', 'b');
        template.set('two', 'd');

        called.should.be.true;
      });

      it('should emit `set`', function () {
        var called = false;
        var template = new Template();

        template.on('set', function (key, value) {
          called = true;
          value.should.eql('baz');
        });

        template.set('foo', 'baz');
        called.should.be.true;
      });

      it('should emit `enabled` when a value is enabled', function () {
        var template = new Template();
        var called = false;

        template.once('enable', function (key, value) {
          called = true;
          template.enable('hidden');
        });

        template.enable('option');
        template.enabled('hidden').should.be.true;
        called.should.be.true;
      });

      it('should emit `disable` when items on the cache are disabled.', function () {
        var called = false;
        var template = new Template();

        template.enable('foo');
        template.enabled('foo').should.be.true;

        template.once('disable', function (key, value) {
          called = true;
        });

        template.disable('foo');
        called.should.be.true;

        template.enabled('foo').should.be.false;
      });

      it('should emit `clear` when an item is removed from the cache', function () {
        var called = false;
        var template = new Template();
        template.set('one', 'a');
        template.set('two', 'c');

        template.on('clear', function (key, value) {
          called = true;
          template.get(key).should.be.undefined;
        });

        template.clear('one');
        template.clear('two');

        called.should.be.true;
      });

      it('should emit `omit` when items are omitted from the cache', function () {
        var called = false;
        var template = new Template();
        template.set('one', 'a');
        template.set('two', 'c');
        template.set('thr', 'd');
        template.set('fou', 'e');
        template.set('fiv', 'f');
        template.set('six', 'g');
        template.set('sev', 'h');

        template.on('omit', function (key) {
          template.get(key).should.be.undefined;
          called = true;
        });

        template.omit(['one', 'two', 'thr', 'fou', 'fiv', 'six', 'sev']);

        called.should.be.true;
      });


      it('should emit `merged` when items are merged into the cache', function () {
        var called = false;
        var template = new Template();

        template.on('merge', function (key) {
          template.get(key).should.be.undefined;
          called = true;
        });

        template.merge({ one: 'a' });
        template.merge({ two: 'c' });
        template.merge({ thr: 'd' });
        template.merge({ fou: 'e' });
        template.merge({ fiv: 'f' });
        template.merge({ six: 'g' });
        template.merge({ sev: 'h' });

        called.should.be.true;
      });
    });
  });
});
