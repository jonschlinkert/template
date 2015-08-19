'use strict';

/* deps: mocha */
var path = require('path');
var assert = require('assert');
var should = require('should');
var matter = require('parser-front-matter');
var App = require('..');
var app;

describe('content', function () {
  beforeEach(function () {
    app = new App();
    app.create('post');
    app.engine('md', require('engine-lodash'));
    app.onLoad(/\.md$/, function (view, next) {
      matter.parse(view, next);
    });
  })

  it('should use matching data from `cache.data`:', function (done) {
    app.posts.option('renameKey', function (key) {
      return path.basename(key, path.extname(key));
    });

    app.data('test/fixtures/data/*.json');
    app.post('test/fixtures/*.md');
    app.views.posts.should.have.property('matched');
    
    app.render('matched', function (err, res) {
      if (err) return done(err);
      res.content.should.equal('This is data from fixture matched.json');
      done();
    });
  });

  it('should use generic data from `cache.data` when no matching names are found:', function (done) {
    app.data('test/fixtures/data/*.json');

    app.post('test/fixtures/*.md');
    app.views.posts.should.have.property('test/fixtures/generic.md');

    app.render('test/fixtures/generic.md', function (err, res) {
      if (err) return done(err);
      res.content.should.equal('This is generic data from data.json!');
      done();
    });
  });

  it('should use data from front-matter:', function (done) {
    app.data('test/fixtures/data/*.json');

    app.post('test/fixtures/*.md');
    app.views.posts.should.have.property('test/fixtures/front-matter.md');

    app.render('test/fixtures/front-matter.md', function (err, res) {
      if (err) return done(err);
      res.content.should.equal('This is data from front matter');
      done();
    });
  });

  it('should use data passed as an object to the `data` method:', function (done) {
    app.data({title: 'foo!'});

    app.post('test/fixtures/*.md');
    app.views.posts.should.have.property('test/fixtures/generic.md');

    app.render('test/fixtures/generic.md', function (err, res) {
      if (err) return done(err);
      res.content.should.equal('This is foo!');
      done();
    });
  });

  it('should prefer front-matter over generic data:', function (done) {
    app.data({title: 'foo'});

    app.post('test/fixtures/*.md');
    app.views.posts.should.have.property('test/fixtures/front-matter.md');

    app.render('test/fixtures/front-matter.md', function (err, res) {
      if (err) return done(err);
      res.content.should.equal('This is data from front matter');
      done();
    });
  });

  it('should prefer front-matter over matched data:', function (done) {
    app.data('test/fixtures/data/*.json');

    app.post('test/fixtures/*.md');
    app.views.posts.should.have.property('test/fixtures/matched-matter.md');

    app.render('test/fixtures/matched-matter.md', function (err, res) {
      if (err) return done(err);
      res.content.should.equal('This is matched and front-matter data!');
      done();
    });
  });

  it('should prefer front-matter over matched data passed as an object:', function (done) {
    app.data({'matched-matter': {title: 'foo'}});

    app.post('test/fixtures/*.md');
    app.views.posts.should.have.property('test/fixtures/matched-matter.md');

    app.render('test/fixtures/matched-matter.md', function (err, res) {
      if (err) return done(err);
      res.content.should.equal('This is matched and front-matter data!');
      done();
    });
  });
});
