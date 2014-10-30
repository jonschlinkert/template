/*!
 * engine <https://github.com/jonschlinkert/engine>
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
});
