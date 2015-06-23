'use strict';

var assert = require('assert');
var should = require('should');
var App = require('..');
var app

describe('loaders', function () {
  beforeEach(function () {
    app = new App();
  })

  it('should throw an error when a loader is registered without an iterator:', function () {
    (function () {
      app.loader('a', function () {});
    }).should.throw('LoaderCache: invalid loader type: sync');
  });

  it('should register an iterator:', function () {
    app.iterator('sync', function () {});
    app.loaders.should.have.property('sync');
    app.loaders.sync.should.have.property('iterator');
    assert.equal(typeof app.loaders.sync.iterator.fn, 'function');
  });

  it('should register a loader:', function () {
    app.iterator('sync', function () {});
    app.loader('a', function () {});
    app.loaders.should.have.property('sync');
    app.loaders.sync.should.have.property('a');
  });
});
