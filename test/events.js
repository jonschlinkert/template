/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('./app');
var template = new Template();

describe('events:', function () {
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

    it('should emit `del` when an item is removed from the cache', function () {
      var called = false;
      var template = new Template();
      template.set('one', 'a');
      template.set('two', 'c');

      template.on('del', function (key, value) {
        called = true;
        assert(template.get(key) == null);
      });

      template.del('one');
      template.del('two');

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

      template.on('omit', function (keys) {
        called = true;
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          assert(template.get(key) == null);
        }
      });

      template.omit(['one', 'two', 'thr', 'fou', 'fiv', 'six', 'sev']);
      called.should.be.true;
    });
  });
});
