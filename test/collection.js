'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app

describe('collections', function () {
  describe('create', function () {
    beforeEach(function () {
      app = new App();
    })

    it('should create a new template collection:', function () {
      app.create('foo');
      assert.equal(typeof app.foo, 'function');
    });

    it('should add the plural name of the collection to views:', function () {
      app.create('foo');
      app.views.should.have.property('foos');
    });
  });
});


