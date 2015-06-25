'use strict';

var assert = require('assert');
var should = require('should');
var Router = require('en-route').Router;
var App = require('..');
var app;

function append(str) {
  return function(file, next) {
    file.content += ' ' + str;
    next();
  };
}
function prepend(str) {
  return function(file, next) {
    file.content = str + ' ' + file.content;
    next();
  };
}

describe('routes', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
  });

  describe('params', function () {
    it('should call param function when routing', function(done) {
      app.param('id', function(file, next, id) {
        assert.equal(id, '123');
        next();
      });

      app.all('/foo/:id/bar', function(file, next) {
        assert.equal(file.options.params.id, '123');
        next();
      });

      app.router.handle({ path: '/foo/123/bar' }, done);
    });
  });

  describe('onLoad middleware', function () {
    it('should run when templates are loaded:', function () {
      app.onLoad(/\.tmpl/, prepend('onLoad'));
      app.pages('a.tmpl', { path: 'a.tmpl', content: '<%= name %>', name: 'aaa' });

      var page = app.pages.get('a.tmpl');
      page.content.should.equal('onLoad <%= name %>');
    });
  });

  describe('preCompile middleware', function () {
    it('should run before templates are compiled:', function () {

    });
  });

  describe('postCompile middleware', function () {
    it('should run after templates are compiled:', function () {

    });
  });

  describe('preRender middleware', function () {
    it('should run before templates are rendered:', function (done) {
      app.preRender(/\.tmpl/, prepend('preRender'));
      app.pages('a.tmpl', { path: 'a.tmpl', content: '<%= name %>', name: 'aaa' });

      var page = app.pages.get('a.tmpl');
      page.content.should.equal('<%= name %>');

      page.render({}, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('preRender aaa');
        done();
      });
    });
  });

  describe('postRender middleware', function () {
    it('should run after templates are rendered:', function (done) {
      app.postRender(/\.tmpl/, append('postRender'));
      app.pages('a.tmpl', { path: 'a.tmpl', content: '<%= name %>', name: 'aaa' });

      var page = app.pages.get('a.tmpl');
      page.content.should.equal('<%= name %>');

      page.render({}, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('aaa postRender');
        done();
      });
    });
  });
});
