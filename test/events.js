'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('app events', function () {
  beforeEach(function () {
    app = new App();
  })

  it('should emit events:', function () {
    var keys = [];
    app.on('a', function (key) {
      keys.push(key);
    });
    app.emit('a', 'one');
    app.emit('a', 'two');
    keys.should.eql(['one', 'two']);
  });
});
