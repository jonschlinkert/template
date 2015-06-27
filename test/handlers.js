'use strict';

/* deps: mocha */
var fs = require('fs');
var extend = require('extend-shallow');
var assert = require('assert');
var should = require('should');
var glob = require('globby');
var utils = require('../lib/utils');
var App = require('..');
var app

describe('handlers', function () {
  describe('custom handlers', function () {
    beforeEach(function () {
      app = new App();
      app.create('page');
    });

    it('should add custom middleware handlers:', function () {
      app.handler('foo');
      app.router.should.have.property('foo');
      assert.equal(typeof app.router.foo, 'function');
    });

    it('should add custom middleware handlers:', function () {
      app.handler('foo');
      app.handler('bar');

      app.foo(/./, function (view, next) {
        view.one = 'aaa';
        next();
      });

      app.bar(/./, function (view, next) {
        view.two = 'zzz';
        next();
      });

      app.pages('test/fixtures/*.txt')
        .pages(function (views, options) {
          return function (view, key) {
            app.handle('foo', view);
            return views;
          }
        })
        .pages('test/fixtures/*.md')
        .pages(function (views, options) {
          return function (view, key) {
            app.handle('bar', view);
            return views;
          }
        })
        .use(utils.rename);

      app.pages.get('a.txt').should.have.property('one');
      app.pages.get('a.txt').should.have.property('two');

      app.pages.get('a.md').should.not.have.property('one');
      app.pages.get('a.md').should.have.property('two');
    });

    it('should add custom middleware handlers:', function () {
      app.handler('foo');
      app.handler('bar');

      function handle(method) {
        return function (view) {
          return app.handle(method, view);
        }
      }

      app.foo(/./, function (view, next) {
        view.one = 'aaa';
        next();
      });

      app.bar(/./, function (view, next) {
        view.two = 'zzz';
        next();
      });

      app.pages('test/fixtures/*.txt')
        .forOwn(handle('foo'))

        .pages('test/fixtures/*.md')
        .forOwn(handle('bar'))

        .use(utils.rename);

      app.pages.get('a.txt').should.have.property('one');
      app.pages.get('a.txt').should.have.property('two');

      app.pages.get('a.md').should.not.have.property('one');
      app.pages.get('a.md').should.have.property('two');
    });
  });
});
