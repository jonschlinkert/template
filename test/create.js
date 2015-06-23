'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app

describe('create', function () {
  beforeEach(function () {
    app = new App();
  })

  it('should create a new template type:', function () {
    app.create('foo');
    app.views.should.have.property('foos');
    console.log(app)
  });
});
