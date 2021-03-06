'use strict';

/* deps: mocha */
var path = require('path');
var assert = require('assert');
var should = require('should');
var once = require('once');
var App = require('..');
var app;

describe('collections', function () {
  describe('create', function () {
    beforeEach(function () {
      app = new App();
      app.engine('md', require('engine-lodash'));
      app.create('posts');
    })

    it.skip('should create a new collection:', function (done) {
      done = once(done);
      app.posts('test/fixtures/posts/**/*.md');

      app.posts.list('recent')
        .recent()
        .filter(function (item) {
          return path.basename(item.path) === 'two.md';
        })
        .sortBy()
        .groupBy()
        .forOwn(function (view, key) {
          view.render(function (err, res) {
            done(err);
          });
        });

        // done();
    });
  });
});
