'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('globby');
var assert = require('assert');
var should = require('should');
var utils = require('../lib/utils');
var App = require('..');
var app;


describe('collection methods', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
  });

  describe('chaining', function () {
    it('should allow collection methods to be chained:', function () {
      app.pages('test/fixtures/*.txt')
        .pages('test/fixtures/*.md');

      app.views.pages.should.have.properties([
        'test/fixtures/a.txt',
        'test/fixtures/a.md'
      ]);
    });
  });

  describe('.context', function (done) {
    it('should expose `.context` for calculating the context of a view:', function (done) {
      app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>'});
      var page = app.pages.get('foo.tmpl');
      assert.equal(typeof page.context, 'function');
      done();
    });

    it('should calculate view locals:', function (done) {
      app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}});
      var page = app.pages.get('foo.tmpl');
      var ctx = page.context();
      ctx.should.have.property('a');
      ctx.a.should.eql('b');
      done();
    });

    it('should calculate view data:', function (done) {
      app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {c: 'd'}});
      var page = app.pages.get('foo.tmpl');
      var ctx = page.context();
      ctx.should.have.properties(['a', 'c']);
      ctx.a.should.eql('b');
      ctx.c.should.eql('d');
      done();
    });

    it('should give locals preference over data:', function (done) {
      app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {a: 'd'}});
      var page = app.pages.get('foo.tmpl');
      var ctx = page.context();
      ctx.should.have.property('a');
      ctx.a.should.eql('b');
      done();
    });

    it('should extend the context with an object passed to the method:', function (done) {
      app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {a: 'd'}});
      var page = app.pages.get('foo.tmpl');
      var ctx = page.context({foo: 'bar'});
      ctx.should.have.properties(['a', 'foo']);
      ctx.a.should.eql('b');
      ctx.foo.should.eql('bar');
      done();
    });

    it('should extend `view.locals` with the object passed to the method:', function (done) {
      app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {a: 'd'}});
      var page = app.pages.get('foo.tmpl');
      var ctx = page.context({foo: 'bar'});
      page.locals.should.have.properties(['a', 'foo']);
      page.locals.a.should.eql('b');
      page.locals.foo.should.eql('bar');
      done();
    });
  });

  describe('.get', function () {
    it('should get the given page:', function () {
      var page = app.pages('test/fixtures/*.txt')
        .get('test/fixtures/a.txt')

      page.path.should.equal('test/fixtures/a.txt');
      app.views.pages.should.have.property('test/fixtures/a.txt');
    });

    it('should run a middleware then the given page:', function () {
      var page = app.pages('test/fixtures/*.txt')
        .use(utils.rename)
        .get('a.txt');

      page.path.should.equal('test/fixtures/a.txt');
      app.views.pages.should.have.properties('a.txt', 'b.txt', 'c.txt');
    });
  });

  describe('.forOwn:', function (done) {
    it('should expose `own` collection items as params on the given function:', function () {
      app.pages('a', {path: 'a', content: '<%= a %>', a: 'bbb'});
      app.pages('b', {path: 'a', content: '<%= a %>', a: 'bbb'});
      app.pages('c', {path: 'a', content: '<%= a %>', a: 'bbb'});
      var keys = [];

      app.pages.forOwn(function (view, key) {
        keys.push(key);
      });

      keys.should.eql(['a', 'b', 'c']);
    });
  });

  describe('loaders', function () {
    it('should use generic loaders:', function () {
      app.loader('foo', function (views, opts) {
        return glob.sync.bind(glob);
      });

      app.loader('bar', ['foo'], function (views, opts) {
        return function (files) {
          return files.reduce(function (acc, fp) {
            views.set(fp, {path: fp, content: fs.readFileSync(fp, 'utf8')});
            return acc;
          }, {});
        }
      });

      app.pages('test/fixtures/*.txt', ['bar']);
      app.views.pages.should.have.property('test/fixtures/a.txt');
    });
  });

  describe('.use', function () {
    it('should expose `.use` for running plugins on views:', function () {
      app
        .pages('test/fixtures/*.txt')
        .use(utils.rename);

      app.views.pages.should.have.properties('a.txt', 'b.txt', 'c.txt');
    });
  });
});
