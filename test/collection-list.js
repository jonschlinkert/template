'use strict';

/* deps: mocha */
var path = require('path');
var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('collections', function () {
  describe('create', function () {
    beforeEach(function () {
      app = new App();
      app.engine('md', require('engine-lodash'));
      app.create('posts');
    })

    it('should create a new collection:', function (done) {
      app.posts('test/fixtures/posts/**/*.md');

      app.posts.list('recent')
        .recent()
        .filter(function (item) {
          return path.basename(item.path) === 'two.md';
        })
        .sortBy()
        .groupBy()
        .forOwn(function (view, key) {
      console.log(view.render)
          view.render(function (err, res) {
            
          });
        });

        // done();
    });
  });
});
