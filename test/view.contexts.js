'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var extend = require('extend-shallow');
var matter = require('parser-front-matter');
var App = require('..');
var app;

describe('context', function () {
  beforeEach(function () {
    app = new App();
    app.engine(['tmpl', 'md'], require('engine-lodash'));
    app.create('page');
  });

  describe('contexts', function () {
    it('should add view locals to `view.contexts`', function (done) {
      app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}});
      var page = app.pages.get('foo.tmpl');
      var ctx = page.context();
      ctx.should.have.property('a');
      ctx.a.should.eql('b');
      done();
    });

    it('should add view data to `view.contexts`', function (done) {
      app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {c: 'd'}});
      var page = app.pages.get('foo.tmpl');
      var ctx = page.context();
      page.locals.should.have.properties(['a', 'c']);
      ctx.a.should.equal('b');
      ctx.c.should.equal('d');
      done();
    });
  });

  describe('calculate context()', function () {
    it('should calculate locals over data:', function (done) {
      app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {a: 'd'}});
      var page = app.pages.get('foo.tmpl');
      var ctx = page.context();
      ctx.should.have.property('a');
      ctx.a.should.equal('d');
      done();
    });
  })
});
