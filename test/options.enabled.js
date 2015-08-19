'use strict';

var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('.enabled() / .enable()', function () {
  beforeEach(function() {
    app = new App();
  });

  describe('.enable()', function () {
    it('should set the value to true', function () {
      app.enable('foo').should.equal(app);
      app.option('foo').should.be.true
    });
  });

  describe('.enabled()', function () {
    it('should default to false', function () {
      app.enabled('xyz').should.be.false;
    });

    it('should return true when set', function () {
      app.option('a', 'b');
      app.enabled('a').should.be.true
    });

    it('should return true when set', function () {
      app.option('a', false);
      app.enabled('a').should.be.false;
    });
  });

  describe('.disable()', function () {
    it('should set the value to false', function () {
      app.disable('foo').should.equal(app);
      app.option('foo').should.be.false;
    });
  });
  describe('.disabled()', function () {
    it('should default to true', function () {
      app.disabled('xyz').should.be.true
    });

    it('should return false when set', function () {
      app.option('abc', 'xyz');
      app.disabled('abc').should.be.false;
    });
  });

  describe('.enable/enabled()', function () {
    it('should set the value to true', function () {
      app.enable('foo');
      app.enabled('foo').should.be.true;
    });

    it('should return `this`', function () {
      app.enable('foo').should.equal(app);
    });

    it('should default to false', function () {
      app.enabled('xyz').should.be.false;
    });

    it('should return true when set', function () {
      app.enable('a');
      app.enabled('a').should.be.true;
    });

    it('should return `false` when set to `false` as an option.', function () {
      app.option('a', false);
      app.enabled('a').should.be.false;
    });

    it('should return true when set as an option.', function () {
      app.option('a', true);
      app.enabled('a').should.be.true;
    });
  });

  describe('.disable/disabled()', function () {
    it('should set the value to false', function () {
      app.disable('foo');
      app.disabled('foo').should.be.true;
      app.enabled('foo').should.be.false;
    });

    it('should return `this`', function () {
      app.disable('foo').should.eql(app);
    });

    it('should default to true', function () {
      app.disabled('xyz').should.be.true;
    });

    it('should return false when set', function () {
      app.disable('abc');
      app.disabled('abc').should.be.true;
    });
  });
});
