/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var template;


describe('.enabled() / .enable()', function () {
  beforeEach(function() {
    template = new Template();
  });

  describe('.enable()', function () {
    it('should set the value to true', function () {
      template.enable('foo').should.equal(template);
      template.option('foo').should.be.true
    });
  });

  describe('.enabled()', function () {
    it('should default to false', function () {
      template.enabled('xyz').should.be.false;
    });

    it('should return true when set', function () {
      template.option('a', 'b');
      template.enabled('a').should.be.true
    });

    it('should return true when set', function () {
      template.option('a', false);
      template.enabled('a').should.be.false;
    });
  });

  describe('.disable()', function () {
    it('should set the value to false', function () {
      template.disable('foo').should.equal(template);
      template.option('foo').should.be.false;
    });
  });
  describe('.disabled()', function () {
    it('should default to true', function () {
      template.disabled('xyz').should.be.true
    });

    it('should return false when set', function () {
      template.option('abc', 'xyz');
      template.disabled('abc').should.be.false;
    });
  });
});