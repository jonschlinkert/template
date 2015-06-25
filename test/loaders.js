'use strict';

var assert = require('assert');
var should = require('should');
var App = require('..');
var app

describe('loaders', function () {
  beforeEach(function () {
    app = new App();
  });

  it('should register an iterator:', function () {
    app.iterator('sync', function () {});
    app.loaders.iterators.should.have.property('sync');
    assert.equal(typeof app.loaders.iterators.sync, 'function');
  });

  it('should register a loader:', function () {
    app.loader('a', function () {});
    app.loaders.should.have.property('a');
  });

  it('should register a loader:', function () {
    app.iterator('async', function () {});
    app.loader('a', {loaderType: 'async'}, function () {});
    app.loaders.should.have.property('async');
    app.loaders.async.should.have.property('a');
  });
});
