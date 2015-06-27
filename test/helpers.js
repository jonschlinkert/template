'use strict';

/* deps: mocha swig */
var assert = require('assert');
var should = require('should');
var async = require('async');
var matter = require('parser-front-matter');
var consolidate = require('consolidate');
var handlebars = require('engine-handlebars');
var lodash = consolidate.lodash;
var swig = consolidate.swig;

var App = require('..');
var app;

describe('sync helpers', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
  })

  it('should register a helper:', function () {
    app.helper('a', function () {});
    app.helper('b', function () {});
    app._.helpers.sync.should.have.property('a');
    app._.helpers.sync.should.have.property('b');
  });

  it('should use a helper:', function (done) {
    app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= upper(a) %>', a: 'bbb'});
    app.helper('upper', function (str) {
      return str.toUpperCase();
    });

    var page = app.pages.get('a.tmpl');
    app.render(page, function (err, view) {
      if (err) return done(err);

      assert.equal(typeof view.content, 'string');
      assert.equal(view.content, 'BBB');
      done();
    });
  });
});

describe('async helpers', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
  })

  it('should register an async helper:', function () {
    app.asyncHelper('a', function () {});
    app.asyncHelper('b', function () {});
    app._.helpers.async.should.have.property('a');
    app._.helpers.async.should.have.property('b');
  });

  it('should use an async helper:', function (done) {
    app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= lower(a) %>', a: 'BBB'});
    app.asyncHelper('lower', function (str, next) {
      if (typeof next !== 'function') return str;
      next(null, str.toLowerCase());
    });

    var page = app.pages.get('a.tmpl');
    app.render(page, function (err, view) {
      if (err) return done(err);
      assert.equal(typeof view.content, 'string');
      assert.equal(view.content, 'bbb');
      done();
    });
  });
});

describe('built-in helpers:', function () {
  describe('automatically generated helpers for default view types:', function () {
    beforeEach(function () {
      app = new App();
      app.engine(['tmpl', 'md'], require('engine-lodash'));
      app.create('partial', { viewType: 'partial' });
      app.create('page');

      // parse front matter
      app.onLoad(/./, function (view, next) {
        matter.parse(view, next);
        next();
      });
    });

    it('should pass view locals to the `partial` helper.', function (done) {
      app.partial('a.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      app.page('b.md', {path: 'b.md', content: 'foo <%= partial("a.md") %> bar'});

      app.render('b.md', function (err, res) {
        if (err) return done(err);
        res.content.should.equal('foo BBB bar');
        done();
      });
    });

    it('should use helper locals.', function (done) {
      app.partial('abc.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      app.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md", { name: "CCC" }) %> bar'});

      app.render('xyz.md', {name: 'DDD'}, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('foo CCC bar');
        done();
      });
    });

    it('should use front matter data.', function (done) {
      app.partial('abc.md', {content: '---\nname: "AAA"\n---\n<%= name %>'});
      app.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md") %> bar'});

      app.render('xyz.md', {name: 'DDD'}, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('foo AAA bar');
        done();
      });
    });

    it.skip('should use render method locals', function (done) {
      app.partial('abc.md', {content: '<%= name %>'});
      app.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md") %> bar'});

      app.render('xyz.md', {name: 'DDD'}, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('foo DDD bar');
        done();
      });
    });

    it('should return an empty string when the partial is missing.', function (done) {
      app.partial('abc.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      app.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("def.md", { name: "CCC" }) %> bar'});

      app.render('xyz.md', {name: 'DDD'}, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('foo  bar');
        done();
      });
    });

    it.skip('should throw an error when something is wrong in a partial', function (done) {
      var called = false;
      var cb = function (err) {
        if (called) return;
        called = true;
        done(err);
      };

      app.partial('abc.md', {content: '---\nname: "AAA"\n---\n<%= name %> - <%= foo(name) %>', locals: {name: 'BBB'}});
      app.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md", { name: "CCC" }) %> bar'});
      app.render('xyz.md', {name: 'DDD'}, function (err, res) {
        if (!err) return cb('Expected an error.');
        cb();
      });
    });
  });

  describe('helper context:', function () {
    beforeEach(function () {
      app = new App();
      app.engine(['tmpl', 'md'], require('engine-lodash'));
      app.create('partial', { viewType: 'partial' });
      app.create('page');

      // parse front matter
      app.onLoad(/./, function (view, next) {
        matter.parse(view, next);
        next();
      });
    });

    it.skip('should prefer front-matter over view locals and helper locals.', function (done) {
      app.disable('prefer locals');
      app.partial('a.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      app.page('b.md', {path: 'b.md', content: 'foo <%= partial("a.md") %> bar'})

      app.render('b.md', function (err, res) {
        if (err) return done(err);
        res.content.should.equal('foo AAA bar');
        done();
      });
    });

    it('should prefer helper locals over view locals.', function (done) {
      app.partial('abc.md', {content: '<%= name %>', name: 'BBB'});
      app.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md", { name: "CCC" }) %> bar'});

      app.render('xyz.md', {name: 'DDD'}, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('foo CCC bar');
        done();
      });
    });

    it('should give preference to view locals over render locals.', function (done) {
      app.partial('abc.md', {content: '<%= name %>', name: 'BBB'});
      app.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md") %> bar'});

      var page = app.pages.get('xyz.md');

      app.render(page, {name: 'DDD'}, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('foo BBB bar');
        done();
      });
    });

    it.skip('should use render locals when other locals are not defined.', function (done) {
      app.partial('abc.md', {content: '<%= name %>'});
      app.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md") %> bar'});

      app.render('xyz.md', {name: 'DDD'}, function (err, res) {
        if (err) return done(err);
        console.log(res)
        // res.content.should.equal('foo DDD bar');
        done();
      });
    });
  });

  describe('user-defined engines:', function () {
    beforeEach(function () {
      app = new App();
      app.create('partial', { viewType: 'partial' });
      app.create('page');

      // parse front matter
      app.onLoad(/./, function (view, next) {
        matter.parse(view, next);
        next();
      });
    });

    it('should use the `partial` helper with handlebars.', function (done) {
      app.engine(['tmpl', 'md'], require('engine-lodash'));
      app.engine('hbs', handlebars);

      app.partial('title.hbs', {content: '<title>{{name}}</title>', locals: {name: 'BBB'}});
      app.page('a.hbs', {path: 'a.hbs', content: 'foo {{{partial "title.hbs" this}}} bar'});

      app.render('a.hbs', {name: 'Halle Nicole' }, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('foo <title>Halle Nicole</title> bar');
        done();
      });
    });

    it('should use the `partial` helper with any engine.', function (done) {
      app.engine('hbs', handlebars);
      app.engine('md', handlebars);
      app.engine('swig', swig);
      app.engine('tmpl', lodash);

      app.partial('a.hbs', {content: '---\nname: "AAA"\n---\n<title>{{name}}</title>', locals: {name: 'BBB'}});
      app.page('a.hbs', {path: 'a.hbs', content: '<title>{{author}}</title>', locals: {author: 'Halle Nicole'}});
      app.page('b.tmpl', {path: 'b.tmpl', content: '<title><%= author %></title>', locals: {author: 'Halle Nicole'}});
      app.page('d.swig', {path: 'd.swig', content: '<title>{{author}}</title>', locals: {author: 'Halle Nicole'}});
      app.page('e.swig', {path: 'e.swig', content: '<title>{{author}}</title>', locals: {author: 'Halle Nicole'}});
      app.page('f.hbs', {content: '<title>{{author}}</title>', locals: {author: 'Halle Nicole'}});
      app.page('g.md', {content: '---\nauthor: Brian Woodward\n---\n<title>{{author}}</title>', locals: {author: 'Halle Nicole'}});
      app.page('with-partial.hbs', {path: 'with-partial.hbs', content: '{{{partial "a.hbs" custom.locals}}}'});

      var locals = {custom: {locals: {name: 'Halle Nicole' }}};
      app.render('a.hbs', locals, function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('<title>Halle Nicole</title>');
      });

      app.render('with-partial.hbs', locals, function (err, res) {
        if (err) return console.log(err);
        res.content.should.equal('<title>Halle Nicole</title>');
      });

      var page = app.pages.get('g.md');
      page.render(locals, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('<title>Halle Nicole</title>');
        done(null, res.content);
      });
    });
  });
});
