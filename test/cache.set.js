/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var template;


describe('template.get()/.set()', function () {
  beforeEach(function() {
    template = new Template();
  });

  describe('.set()', function () {
    it('should set a value', function () {
      template.set('a', 'b');
      template.get('a').should.equal('b');
    });

    it('should set properties on the `cache` object.', function () {
      template.set('a', 'b');
      template.cache.a.should.equal('b');
    });

    it('should allow an object to be set directly.', function () {
      template.set({x: 'y'});
      template.cache.x.should.equal('y');
      template.get('x').should.equal('y');
    });

    it('should set nested properties on the `cache` object.', function () {
      template.set('c', {d: 'e'});
      template.get('c').d.should.equal('e');
    });

    it('should use dot notation to `set` values.', function () {
      template.set('h.i', 'j');
      template.get('h').should.eql({i: 'j'});
    });

    it('should use dot notation to `get` values.', function () {
      template.set('h', {i: 'j'});
      template.get('h.i').should.equal('j');
    });

    it('should return `this` for chaining', function () {
      template.set('a', 'b').should.equal(template);
      template
        .set('aa', 'bb')
        .set('bb', 'cc')
        .set('cc', 'dd');
      template.get('aa').should.equal('bb');
      template.get('bb').should.equal('cc');
      template.get('cc').should.equal('dd');
    });

    it('should return undefined when not set', function () {
      template.set('a', undefined).should.equal(template);
    });
  });

  describe('.get()', function () {
    it('should return undefined when not set', function () {
      (template.get('a') == null).should.be.true;
    });

    it('should otherwise return the value', function () {
      template.set('a', 'b');
      template.get('a').should.equal('b');
    });
  });


  describe('.exists()', function () {
    it('should return `false` when not set', function () {
      template.exists('alsjls').should.be.false;
    });

    it('should return `true` when set.', function () {
      template.set('baba', 'zz');
      template.exists('baba').should.be.ok;
    });
  });
});