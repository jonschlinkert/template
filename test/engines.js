'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('engines', function () {
  beforeEach(function () {
    app = new App();
    app.create('pages');
    app.pages('foo.tmpl', {content: 'A <%= letter %> {{= letter }} C'});
    app.pages('bar.tmpl', {content: 'A <%= letter %> {{ letter }} C'});
  })

  it('should register an engine:', function () {
    app.engine('a', {render: function () {}});
    app.engines.should.have.property('.a');
  });

  it('should use custom delimiters:', function (done) {
    app.engine('tmpl', require('engine-lodash'), {
      delims: ['{{', '}}']
    });
    app.render('foo.tmpl', {letter: 'B'}, function (err, res) {
      if (err) return done(err);
      res.content.should.equal('A <%= letter %> B C');
      done();
    });
  });

  it('should override individual delims values:', function (done) {
    app.engine('tmpl', require('engine-lodash'), {
      interpolate: /\{{([^}]+)}}/g,
      delims: ['{{', '}}']
    });
    app.render('bar.tmpl', {letter: 'B'}, function (err, res) {
      if (err) return done(err);
      res.content.should.equal('A <%= letter %> B C');
      done();
    });
  });

  it('should get an engine:', function () {
    app.engine('a', {
      render: function () {}
    });
    var a = app.engine('a');
    a.should.have.property('render');
  });
});
