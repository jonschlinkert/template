/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var template = new Template();


describe('engine get/set', function () {
  afterEach(function() {
    template.clear();
  });

  describe('.enable()', function () {
    it('should set the value to true', function () {
      template.enable('foo').should.equal(template);
      template.get('foo').should.be.ok;
    });
  });

  describe('.enabled()', function () {
    it('should default to false', function () {
      template.enabled('xyz').should.be.false;
    });

    it('should return true when set', function () {
      template.set('a', 'b');
      template.enabled('a').should.be.ok;
    });

    it('should return true when set', function () {
      template.set('a', false);
      template.enabled('a').should.be.false;
    });
  });

  describe('.disable()', function () {
    it('should set the value to false', function () {
      template.disable('foo').should.equal(template);
      template.get('foo').should.be.false;
    });
  });
  describe('.disabled()', function () {
    it('should default to true', function () {
      template.disabled('xyz').should.be.ok;
    });

    it('should return false when set', function () {
      template.set('abc', 'xyz');
      template.disabled('abc').should.be.false;
    });
  });
});