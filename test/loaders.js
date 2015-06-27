'use strict';

var assert = require('assert');
var should = require('should');
var App = require('..');
var app

describe('loaders', function () {
  describe('sync', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should register an iterator:', function () {
      app.iterator('sync', function () {});
      app.loaders.sync.should.have.property('iterator');
      app.loaders.sync.iterator.should.have.property('fn');
      assert.equal(typeof app.loaders.sync.iterator.fn, 'function');
    });

    it('should register a sync loader by default:', function () {
      app.loader('a', function () {});
      app.loaders.sync.should.have.property('a');
    });

    it('should register a loader:', function () {
      app.iterator('async', function () {});
      app.loader('a', {loaderType: 'async'}, function () {});
      app.loaders.should.have.property('async');
      app.loaders.async.should.have.property('a');
    });
  });

  describe('async', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should register an async iterator:', function () {
      app.iterator('async', function () {});
      app.loaders.async.should.have.property('iterator');
      app.loaders.async.iterator.should.have.property('fn');
      assert.equal(typeof app.loaders.async.iterator.fn, 'function');
    });

    it('should register a sync loader by default:', function () {
      app.loader('a', function () {});
      app.loaders.sync.should.have.property('a');
    });

    it('should register a loader:', function () {
      app.iterator('async', function () {});
      app.loader('a', {loaderType: 'async'}, function () {});
      app.loaders.should.have.property('async');
      app.loaders.async.should.have.property('a');
    });
  });

  describe('promise', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should register an iterator:', function () {
      app.iterator('sync', function () {});
      app.loaders.sync.should.have.property('iterator');
      app.loaders.sync.iterator.should.have.property('fn');
      assert.equal(typeof app.loaders.sync.iterator.fn, 'function');
    });

    it('should register a sync loader by default:', function () {
      app.loader('a', function () {});
      app.loaders.sync.should.have.property('a');
    });

    it('should register a loader:', function () {
      app.iterator('async', function () {});
      app.loader('a', {loaderType: 'async'}, function () {});
      app.loaders.should.have.property('async');
      app.loaders.async.should.have.property('a');
    });
  });

  describe('stream', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should register an iterator:', function () {
      app.iterator('sync', function () {});
      app.loaders.sync.should.have.property('iterator');
      app.loaders.sync.iterator.should.have.property('fn');
      assert.equal(typeof app.loaders.sync.iterator.fn, 'function');
    });

    it('should register a sync loader by default:', function () {
      app.loader('a', function () {});
      app.loaders.sync.should.have.property('a');
    });

    it('should register a loader:', function () {
      app.iterator('async', function () {});
      app.loader('a', {loaderType: 'async'}, function () {});
      app.loaders.should.have.property('async');
      app.loaders.async.should.have.property('a');
    });
  });

});
