'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('data', function () {
  beforeEach(function () {
    app = new App();
  })

  it('should set key-value pair on `cache.data`:', function () {
    app.data('a', 'b');
    app.cache.data.should.have.property('a');
  });

  it('should set an object on `cache.data`:', function () {
    app.data({foo: 'bar'});
    app.cache.data.should.have.property('foo');
  });

  it('should set an array of objects on `cache.data`:', function () {
    app.data({one: 'two'}, {three: 'four'});
    app.cache.data.should.have.properties(['one', 'three']);
  });

  it('should extend a property onto `cache.data`:', function () {
    app.data({a: 'b'});
    app.data({c: 'd'});
    app.cache.data.should.eql({a: 'b', c: 'd'});
  });
});
