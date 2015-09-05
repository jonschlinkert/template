'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('../');

describe('getViews', function () {
  it('should get a view collection', function () {
    var app = new App();
    app.create('posts');
    app.post('a.md', {content: '...'});
    app.post('b.md', {content: '...'});

    var a = app.getViews('post');
    var b = app.getViews('posts');

    assert.deepEqual(a, b);
  });
});
