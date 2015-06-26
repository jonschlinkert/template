'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('globby');
var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('collection methods', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.loader('glob', function (views, opts) {
      return glob.sync.bind(glob);
    });

    app.loader('toViews', function (views, opts) {
      return function (files) {
        return files.reduce(function (acc, fp) {
          views.set(fp, {path: fp, content: fs.readFileSync(fp, 'utf8')});
          return acc;
        }, {});
      }
    });

    app.create('page', { loaderType: 'sync' }, ['glob']);
  });

  describe('loaders', function () {
    it('should use generic loaders:', function () {
      app.pages('test/fixtures/*.txt', ['toViews']);
      app.views.pages.should.have.property('test/fixtures/a.txt');
    });
  });

  describe('.use', function () {
    it('should expose `.use` for running plugins on a view:', function () {
      app.pages('test/fixtures/*.txt', ['toViews'], function (views, opts) {
        return function () {
          return views;
        }
      })
        .render('a.tmpl', function (err, res) {
          if (err) return console.log(err);
        });

    });
  });

  describe('.render:', function (done) {
    it('should expose `.render` for rendering a view:', function (done) {
      app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= a %>', a: 'bbb'});
      var page = app.pages.get('a.tmpl');

      page.render({}, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('bbb');
        done();
      });
    });
  });

  // describe('.context', function (done) {
  //   it('should expose `.context` for calculating the context of a view:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>'});
  //     var page = app.pages.get('foo.tmpl');
  //     assert.equal(typeof page.context, 'function');
  //     done();
  //   });

  //   it('should calculate view locals:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}});
  //     var page = app.pages.get('foo.tmpl');
  //     var ctx = page.context();
  //     ctx.should.eql({a: 'b'});
  //     done();
  //   });

  //   it('should calculate view data:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {c: 'd'}});
  //     var page = app.pages.get('foo.tmpl');
  //     var ctx = page.context();
  //     ctx.should.eql({a: 'b', c: 'd'});
  //     done();
  //   });

  //   it('should give locals preference over data:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {a: 'd'}});
  //     var page = app.pages.get('foo.tmpl');
  //     var ctx = page.context();
  //     ctx.should.eql({a: 'b'});
  //     done();
  //   });

  //   it('should extend the context with an object passed to the method:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {a: 'd'}});
  //     var page = app.pages.get('foo.tmpl');
  //     var ctx = page.context({foo: 'bar'});
  //     ctx.should.eql({a: 'b', foo: 'bar'});
  //     done();
  //   });

  //   it('should extend `view.locals` with the object passed to the method:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {a: 'd'}});
  //     var page = app.pages.get('foo.tmpl');
  //     var ctx = page.context({foo: 'bar'});
  //     page.locals.should.eql({a: 'b', foo: 'bar'});
  //     done();
  //   });
  // });
});
