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

describe('renameKey', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
    app.create('post');
  });

  describe('global options:', function () {
    it('should use `renameKey` function defined on global opts:', function () {
      app.option('renameKey', function (key) {
        return path.basename(key, path.extname(key));
      });

      app.create('post');
      app.posts('test/fixtures/*.txt');

      app.views.posts.should.have.property('a');
      app.views.posts.should.have.property('b');
      app.views.posts.should.have.property('c');
    });

    it('should not have conflicts when view name is the collection name:', function () {
      app.option('renameKey', function (key) {
        return path.basename(key, path.extname(key));
      });

      app.create('pages');
      app.create('posts');
      app.post({'a/b/c/post.txt': {content: 'this is contents'}});
      app.page('a/b/c/page.txt', 'this is contents');

      app.views.posts.should.have.property('post');
      app.views.pages.should.have.property('page');
    });
  });


  describe('create method:', function () {
    it('should use `renameKey` defined on the `create` method:', function () {
      app.create('post', {
        renameKey: function (key) {
          return 'posts/' + path.basename(key);
        }
      });

      app.posts('test/fixtures/*.txt');
      app.views.posts.should.have.property('posts/a.txt');
      app.views.posts.should.have.property('posts/b.txt');
      app.views.posts.should.have.property('posts/c.txt');
    });
  });

  describe('collections:', function () {
    describe('setting:', function () {
      it('should use `renameKey` defined on app.options:', function () {
        app.option('renameKey', function (key) {
          return 'foo/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.views.pages.should.have.property('foo/a.txt');
        app.views.pages.should.have.property('foo/b.txt');
        app.views.pages.should.have.property('foo/c.txt');
      });

      it('should use `renameKey` defined on collection.options:', function () {
        app.pages.option('renameKey', function (key) {
          return 'page/' + path.basename(key);
        });

        app.posts.option('renameKey', function (key) {
          return 'post/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.posts('test/fixtures/*.txt');

        app.views.pages.should.have.property('page/a.txt');
        app.views.pages.should.have.property('page/b.txt');
        app.views.pages.should.have.property('page/c.txt');

        app.views.posts.should.have.property('post/a.txt');
        app.views.posts.should.have.property('post/b.txt');
        app.views.posts.should.have.property('post/c.txt');
      });

      it('should use the `app.renameKey()` method:', function () {
        app.renameKey(function (key) {
          return 'baz/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.views.pages.should.have.property('baz/a.txt');
        app.views.pages.should.have.property('baz/b.txt');
        app.views.pages.should.have.property('baz/c.txt');
      });

      it('should use the `collection.renameKey()` method:', function () {
        app.pages.renameKey(function (key) {
          return 'baz/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.views.pages.should.have.property('baz/a.txt');
        app.views.pages.should.have.property('baz/b.txt');
        app.views.pages.should.have.property('baz/c.txt');
      });

      it('should prefer collection method over app.options:', function () {
        app.pages.renameKey(function (key) {
          return 'aaa/' + path.basename(key);
        });
        app.option('renameKey', function (key) {
          return 'foo/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.views.pages.should.have.property('aaa/a.txt');
        app.views.pages.should.have.property('aaa/b.txt');
        app.views.pages.should.have.property('aaa/c.txt');
      });

      it('should prefer collection method over app method:', function () {
        app.pages.renameKey(function (key) {
          return 'aaa/' + path.basename(key);
        });
        app.renameKey(function (key) {
          return 'zzz/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.views.pages.should.have.property('aaa/a.txt');
        app.views.pages.should.have.property('aaa/b.txt');
        app.views.pages.should.have.property('aaa/c.txt');
      });

      it('should prefer collection options over app.options:', function () {
        app.pages.option('renameKey', function (key) {
          return 'bbb/' + path.basename(key);
        });
        app.option('renameKey', function (key) {
          return 'foo/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.views.pages.should.have.property('bbb/a.txt');
        app.views.pages.should.have.property('bbb/b.txt');
        app.views.pages.should.have.property('bbb/c.txt');
      });

      it('should prefer collection options over app method:', function () {
        app.pages.option('renameKey', function (key) {
          return 'bbb/' + path.basename(key);
        });
        app.renameKey(function (key) {
          return 'zzz/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.views.pages.should.have.property('bbb/a.txt');
        app.views.pages.should.have.property('bbb/b.txt');
        app.views.pages.should.have.property('bbb/c.txt');
      });

      it('should use renameKey on chained methods:', function () {
        app
          .pages('test/fixtures/*.txt', {
            renameKey: function foo(key) {
              return 'foo/' + path.basename(key);
            }
          })
          .pages('test/fixtures/*.md', {
            renameKey: function bar(key) {
              return 'bar/' + path.basename(key);
            }
          });

        app.views.pages.should.have.properties([
          'foo/a.txt',
          'bar/a.md'
        ]);
      });
    });

    describe('getting', function () {
      beforeEach(function () {
        app = new App();
        app.engine('tmpl', require('engine-lodash'));
        app.create('page');
      });

      it('should get a view with the `renameKey` defined on the `create` method:', function () {
        app.create('post', {
          renameKey: function (key) {
            return 'posts/' + path.basename(key);
          }
        });

        app.posts('test/fixtures/*.txt');
        app.posts.get('a.txt').should.have.property('path', 'test/fixtures/a.txt');
        app.posts.get('posts/a.txt').should.have.property('path', 'test/fixtures/a.txt');
      });

      it('should get a view with the `renameKey` defined on app.options:', function () {
        app.option('renameKey', function (key) {
          return 'foo/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.views.pages.should.have.property('foo/a.txt');
        app.views.pages.should.have.property('foo/b.txt');
        app.views.pages.should.have.property('foo/c.txt');
      });

      it('should get a view with the `renameKey` defined on collection.options:', function () {
        app.pages.option('renameKey', function (key) {
          return 'bar/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.views.pages.should.have.property('bar/a.txt');
        app.views.pages.should.have.property('bar/b.txt');
        app.views.pages.should.have.property('bar/c.txt');
      });

      it('should get a view with the the `app.renameKey()` method:', function () {
        app.renameKey(function (key) {
          return 'baz/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.views.pages.should.have.property('baz/a.txt');
        app.views.pages.should.have.property('baz/b.txt');
        app.views.pages.should.have.property('baz/c.txt');
      });

      it('should get a view with the the `collection.renameKey()` method:', function () {
        app.pages.renameKey(function (key) {
          return 'baz/' + path.basename(key);
        });

        app.pages('test/fixtures/*.txt');
        app.views.pages.should.have.property('baz/a.txt');
        app.views.pages.should.have.property('baz/b.txt');
        app.views.pages.should.have.property('baz/c.txt');
      });
    });
  });
});
