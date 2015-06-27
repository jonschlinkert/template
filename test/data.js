'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app

describe('data', function () {
  beforeEach(function () {
    app = new App();
  })

  it('should set a property on `cache.data`:', function () {
    app.data('a', 'b');
    app.cache.data.should.have.property('a');
  });

  it('should extend a property onto `cache.data`:', function () {
    app.data({a: 'b'});
    app.data({c: 'd'});
    app.cache.data.should.eql({a: 'b', c: 'd'});
  });
});
