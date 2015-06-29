'use strict';

/* deps: mocha */
var fs = require('fs');
var path = require('path');
var extend = require('extend-shallow');
var assert = require('assert');
var should = require('should');
var glob = require('globby');
var App = require('..');
var app;

describe('renameKey', function () {
  describe('should use custom `renameKey` functions for storing views', function () {
    beforeEach(function () {
      app = new App();
      app.engine('tmpl', require('engine-lodash'));
      app.create('page');
    });

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
        return 'bar/' + path.basename(key);
      });

      app.pages('test/fixtures/*.txt');
      app.views.pages.should.have.property('bar/a.txt');
      app.views.pages.should.have.property('bar/b.txt');
      app.views.pages.should.have.property('bar/c.txt');
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
  });

  describe('should use custom `renameKey` functions for getting views', function () {
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
      app.posts.get('posts/a.txt').should.have.property('path')
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

    // it('should add custom middleware handlers:', function () {
    //   app.option('defaultLoader', false);
    //   app.handler('foo');

    //   app.foo(/./, function (file, next) {
    //     file.foo = 'bar';
    //     next();
    //   });

    //   app.pages('test/fixtures/*.txt', { cwd: process.cwd() }, function (views, options) {
    //     return function (pattern, opts) {
    //         extend(options, opts);

    //         glob.sync(pattern, opts).forEach(function (fp) {
    //           var view = {path: fp, content: fs.readFileSync(fp, 'utf8')}

    //           app.handle('foo', view);
    //           views.set(fp, view);
    //         });

    //         return views;
    //       };
    //     })
    //     .pages('test/fixtures/*.md', function (views, options) {
    //       return function () {
    //         return views;
    //       }
    //     })

    //   // app.pages('foo', {path: 'foo', content: 'this is content'});
    //   // var page = app.pages.get('c.txt');
    //   console.log(app.views.pages)
    // });

});
