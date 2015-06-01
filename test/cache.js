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

describe('cache', function () {
  describe('constructor:', function () {
    it('should be a constructor:', function () {
      var template = new Template();
      template.should.be.instanceOf(Template);
    });
  });

  describe('keys():', function () {
    var template = new Template();
    it('should return the keys of properties on the cache.', function () {
      template.del();

      template.set('a', 1);
      template.set('b', 2);
      template.set('c', 3);

      Object.keys(template.cache).should.eql(['a', 'b', 'c']);
    });
  });

  describe('get/set:', function () {
    var template = new Template();

    afterEach(function() {
      template.del();
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
    template.set(obj);

    it('should get immediate properties.', function() {
      template.get('a').should.eql(obj.a);
    });
    it('should get nested properties.', function() {
      template.get('a.b').should.eql(obj.a.b);
    });
    it('should return undefined for nonexistent properties.', function() {
      assert(template.get('a.x') == null);
    });
    it('should return values.', function() {
      template.get('a.b.c').should.eql(1);
    });
    it('should return values.', function() {
      template.get('a.b.d').should.eql('');
    });
    it('should return values.', function() {
      assert(template.get('a.b.e') == null);
    });
    it('should return values.', function() {
      assert(template.get('a.b.f') == null);
    });
    it('literal backslash should escape period in property name.', function() {
      template.get('a.b.g\\.h\\.i', true).should.equal(2);
    });
    it('should just return existing properties.', function() {
      template.get('a', true).should.eql(template.cache.a);
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
      template.get('e\\.f\\.g', true).should.eql(1);
      template.cache['e.f.g'].should.eql(1);
    });
  });
});
