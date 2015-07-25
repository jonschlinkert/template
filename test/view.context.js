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

  describe('global data', function () {
    it('should use global data:', function (done) {
      app.data({ title: 'foo'});
      app.page('aaa.md', 'a<%= title %>c');

      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('afooc');
        done();
      });
    });

    it('should prefer "matched" global data over global `data`:', function (done) {
      app.data({ title: 'foo'});
      app.data({ 'aaa\\.md': {title: 'bar'}});
      app.page('aaa.md', 'a<%= title %>c');

      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('abarc');
        done();
      });
    });
  });

  describe('method locals', function () {
    it('should pass data to templates in the `.render()` method:', function (done) {
      app.data({ abc: 'xyz'});
      app.page('aaa.md', '<%= abc %>');

      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('xyz');
        done();
      });
    });

    it('should pass data to templates in the `.render()` method:', function (done) {
      app.data({ title: 'b'});
      app.page('aaa.md', 'a<%= title %>c');

      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('abc');
        done();
      });
    });
  });

  describe('view properties', function () {
    it('should use view locals:', function (done) {
      app.page('aaa.md', 'a<%= title %>c', {locals: {title: 'zzz'}});
      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('azzzc');
        done();
      });
    });

    it('should use view data:', function (done) {
      app.page('aaa.md', 'a<%= title %>c', {title: 'zzz'});
      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('azzzc');
        done();
      });
    });

    it('should use view data from front-matter:', function (done) {
      app.onLoad(/\.md$/, function (view, next) {
        matter.parse(view, next);
      });

      app.page('aaa.md', '---\ntitle: Front Matter\n---\na<%= title %>c');
      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('aFront Matterc');
        done();
      });
    });

    it('should prefer front-matter over explicitly defined data:', function (done) {
      app.onLoad(/\.md$/, function (view, next) {
        matter.parse(view, next);
      });

      app.page('aaa.md', '---\ntitle: Front Matter\n---\na<%= title %>c', { title: 'Data'});
      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('aFront Matterc');
        done();
      });
    });

    it('should prefer front-matter over explicitly defined locals:', function (done) {
      app.onLoad(/\.md$/, function (view, next) {
        matter.parse(view, next);
      });

      app.page('aaa.md', '---\ntitle: Front Matter\n---\na<%= title %>c', {locals: { title: 'Data'}});
      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('aFront Matterc');
        done();
      });
    });

    it('should prefer front-matter over explicitly defined locals:', function (done) {
      app.onLoad(/\.md$/, function (view, next) {
        matter.parse(view, next);
      });

      app.page('bbb.md', {content: '---\ntitle: Front Matter\n---\na<%= title %>c', locals: { title: 'Data'}});
      app.render('bbb.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('aFront Matterc');
        done();
      });
    });

    it('should prefer view data over view locals:', function (done) {
      app.page('aaa.md', {content: 'a<%= title %>c', title: 'aaa', locals: {title: 'zzz'}});
      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('aaaac');
        done();
      });
    });

    it('should prefer `data` over `locals`:', function (done) {
      app.data({ title: 'b'});
      app.data({ 'aaa\\.md': {title: 'zzz'}});
      app.page('aaa.md', 'a<%= title %>c', { title: 'bbb'});

      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('abbbc');
        done();
      });
    });

    it('should give preference to front matter when `prefer locals` is disabled:', function (done) {
      app.data({ title: 'b'});
      app.disable('prefer locals');

      app.onLoad(/\.md$/, function (view, next) {
        matter.parse(view, next);
      });

      var page = app.page('aaa.md', '---\ntitle: zzz\n---\na<%= title %>c', { title: 'bbb'});

      app.render('aaa.md', function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('azzzc');
        done();
      });
    });
  });

  describe('helpers', function () {
  });

  describe('context method', function () {
    it('should expose `.context` for calculating the context of a view:', function (done) {
      app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>'});
      var page = app.pages.get('foo.tmpl');
      assert.equal(typeof page.context, 'function');
      done();
    });

    it('should build the context for a view:', function (done) {
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
  });

  describe('custom', function () {
    it('should use a custom `context` function:', function (done) {
      app.data({ title: 'b'});

      app.onLoad(/\.md$/, function (view, next) {
        matter.parse(view, next);
      });

      app.page('aaa.md', '---\ntitle: zzz\n---\na<%= title %>c', { title: 'bbb'});
      var page = app.pages.get('aaa.md');

      page.context(function (data, contexts) {
        contexts.locals.title = contexts.data.title;
        return this;
      });

      app.render(page, function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('azzzc');
        done();
      });
    });
  });
});
