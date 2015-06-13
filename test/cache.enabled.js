/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
require('should');
var Template = require('./app');
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

  describe('.enable/enabled()', function () {
    it('should set the value to true', function () {
      template.enable('foo');
      template.enabled('foo').should.be.true;
    });

    it('should return `this`', function () {
      template.enable('foo').should.equal(template);
    });

    it('should default to false', function () {
      template.enabled('xyz').should.be.false;
    });

    it('should return true when set', function () {
      template.enable('a');
      template.enabled('a').should.be.true;
    });

    it('should return `false` when set to `false` as an option.', function () {
      template.option('a', false);
      template.enabled('a').should.be.false;
    });

    it('should return true when set as an option.', function () {
      template.option('a', true);
      template.enabled('a').should.be.true;
    });
  });

  describe('.disable/disabled()', function () {
    it('should set the value to false', function () {
      template.disable('foo');
      template.disabled('foo').should.be.true;
      template.enabled('foo').should.be.false;
    });

    it('should return `this`', function () {
      template.disable('foo').should.eql(template);
    });

    it('should default to true', function () {
      template.disabled('xyz').should.be.true;
    });

    it('should return false when set', function () {
      template.disable('abc');
      template.disabled('abc').should.be.true;
    });
  });
});
