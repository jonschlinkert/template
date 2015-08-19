'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('engines', function () {
  beforeEach(function () {
    app = new App();
  })

  it('should register an engine:', function () {
    app.engine('a', {
      render: function () {}
    });
    app.engines.should.have.property('.a');
  });

  it('should get an engine:', function () {
    app.engine('a', {
      render: function () {}
    });
    var a = app.engine('a');
    a.should.have.property('render');
  });
});
