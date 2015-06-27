'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var extend = require('extend-shallow');
var matter = require('parser-front-matter');
var App = require('..');
var app

describe('context', function () {
  beforeEach(function () {
    app = new App();
    app.engine(['tmpl', 'md'], require('engine-lodash'));
    app.create('page');
  })

  it('should build the context for a template:', function (done) {
    app.data({title: 'home'});
    app.page('a.tmpl', {
      path: 'a.tmpl',
      content: '<%= a %><%= title %>',
      a: 'this is '
    });

    app.render(app.pages.get('a.tmpl'), function (err, res) {
      if (err) return done(err);
      res.content.should.equal('this is home');
      done();
    });
  });

  it('should pass data to templates in the `.render()` method:', function (done) {
    app.data({ abc: 'xyz'});
    app.page('aaa.md', '<%= abc %>');

    app.render('aaa.md', function (err, res) {
      if (err) console.log(err);
      res.content.should.equal('xyz');
      done();
    });
  });

  it('should pass data to templates in the `.render()` method:', function (done) {
    app.data({ letter: 'b'});
    app.page('aaa.md', 'a<%= letter %>c');

    app.render('aaa.md', function (err, res) {
      if (err) console.log(err);
      res.content.should.equal('abc');
      done();
    });
  });

  it('should give preference to locals over "global" data:', function (done) {
    app.data({ letter: 'b'});
    app.page('aaa.md', 'a<%= letter %>c', { letter: 'bbb'});

    app.render('aaa.md', function (err, res) {
      if (err) console.log(err);
      res.content.should.equal('abbbc');
      done();
    });
  });

  it('should give preference to front matter when `prefer locals` is disabled:', function (done) {
    app.data({ letter: 'b'});
    app.disable('prefer locals');

    app.onLoad(/\.md$/, function (view, next) {
      matter.parse(view, next);
    });

    app.page('aaa.md', '---\nletter: zzz\n---\na<%= letter %>c', { letter: 'bbb'});
    app.render('aaa.md', function (err, res) {
      if (err) console.log(err);
      res.content.should.equal('azzzc');
      done();
    });
  });

  it('should use a custom `context` function:', function (done) {
    app.data({ letter: 'b'});

    app.onLoad(/\.md$/, function (view, next) {
      matter.parse(view, next);
    });

    app.page('aaa.md', '---\nletter: zzz\n---\na<%= letter %>c', { letter: 'bbb'});

    var page = app.pages.get('aaa.md')
      .context(function (data, locals) {
        return extend(locals, data);
      });

    app.render('aaa.md', function (err, res) {
      if (err) console.log(err);
      res.content.should.equal('azzzc');
      done();
    });
  });
});
