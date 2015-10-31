'use strict';

/* deps: mocha */
var fs = require('fs');
var path = require('path');
var extend = require('extend-shallow');
var assert = require('assert');
var should = require('should');
var glob = require('matched');
var App = require('..');
var app;

describe('cwd', function () {
  describe('should use custom `cwd` functions for storing views', function () {
    beforeEach(function () {
      app = new App();
      app.create('pages');
    });

    it('should use `cwd` defined on the `create` method:', function () {
      app.create('post', {cwd: 'test/fixtures'});
      app.posts('*.txt');

      app.views.posts.should.have.property('test/fixtures/a.txt');
      app.views.posts.should.have.property('test/fixtures/b.txt');
      app.views.posts.should.have.property('test/fixtures/c.txt');
    });

    it('should use `cwd` defined on app.options:', function () {
      app.option('cwd', 'test/fixtures');
      app.pages('*.txt');

      app.views.pages.should.have.property('test/fixtures/a.txt');
      app.views.pages.should.have.property('test/fixtures/b.txt');
      app.views.pages.should.have.property('test/fixtures/c.txt');
    });

    it('should use `cwd` defined on collection.options:', function () {
      app.pages.option('cwd', 'test/fixtures');
      app.pages('*.txt');

      app.views.pages.should.have.property('test/fixtures/a.txt');
      app.views.pages.should.have.property('test/fixtures/b.txt');
      app.views.pages.should.have.property('test/fixtures/c.txt');
    });
  });
});
