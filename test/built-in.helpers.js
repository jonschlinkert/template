/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Halle Nicole, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var should = require('should');
var Template = require('..');
var template = new Template();
var consolidate = require('consolidate');
var handlebars = consolidate.handlebars;
var lodash = consolidate.lodash;
var swig = consolidate.swig;
var async = require('async');


describe('generated helpers:', function () {
  describe('helpers for built-in engines:', function () {
    it.only('should use the `partial` helper with a built-in engine.', function (done) {
      template.partial('a.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      template.page('b.md', {path: 'b.md', content: 'foo <%= partial("a.md") %> bar'});

      // console.log(template)
      template.renderCached('b.md', function (err, content) {
        if (err) return done(err);
        content.should.equal('foo AAA bar');
        done();
      });
    });

    it('should use the `partial` helper and locals with a built-in engine.', function (done) {
      template.partial('abc.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md", { name: "CCC" }) %> bar'});

      template.renderCached('xyz.md', {name: 'DDD'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('foo CCC bar');
        done();
      });
    });
  });


  describe('helper context:', function () {
    it('should give preference to front-matter over template locals and helper locals.', function (done) {
      template.partial('a.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      template.page('b.md', {path: 'b.md', content: 'foo <%= partial("a.md") %> bar'});

      template.renderCached('b.md', function (err, content) {
        if (err) return done(err);
        content.should.equal('foo AAA bar');
        done();
      });
    });

    it('should give preference to helper locals over template locals.', function (done) {
      template.partial({'abc.md': {content: '<%= name %>', name: 'BBB'}});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md", { name: "CCC" }) %> bar'});

      template.render('xyz.md', {name: 'DDD'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('foo CCC bar');
        done();
      });
    });

    it('should give preference to template locals over render locals.', function (done) {
      template.partial({'abc.md': {content: '<%= name %>', name: 'BBB'}});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md") %> bar'});

      template.render('xyz.md', {name: 'DDD'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('foo BBB bar');
        done();
      });
    });

    it('should use render locals when other locals are not defined.', function (done) {
      template.partial({'abc.md': {content: '<%= name %>'}});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md") %> bar'});

      template.render('xyz.md', {name: 'DDD'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('foo DDD bar');
        done();
      });
    });
  });


  describe('user-defined engines:', function () {
    it('should use the `partial` helper with handlebars.', function (done) {
      template.engine('hbs', handlebars);

      template.partial('title.hbs', '<title>{{name}}</title>', {name: 'BBB'});
      template.page('a.hbs', {path: 'a.hbs', content: 'foo {{{partial "title.hbs" this}}} bar'});

      template.render('a.hbs', {name: 'Halle Nicole' }, function (err, content) {
        if (err) return done(err);
        content.should.equal('foo <title>Halle Nicole</title> bar');
        done();
      });
    });

    it('should use the `partial` helper with any engine.', function (done) {
      template.engine('hbs', handlebars);
      template.engine('md', handlebars);
      template.engine('swig', swig);
      template.engine('tmpl', lodash);

      template.partial('a.hbs', '---\nname: "AAA"\n---\n<title>{{name}}</title>', {name: 'BBB'});
      template.page({path: 'a.hbs', content: '<title>{{author}}</title>', author: 'Halle Nicole'});
      template.page({path: 'b.tmpl', content: '<title><%= author %></title>', author: 'Halle Nicole'});
      template.page({path: 'd.swig', content: '<title>{{author}}</title>', author: 'Halle Nicole'});
      template.page({'e.swig': {content: '<title>{{author}}</title>', author: 'Halle Nicole'}});
      template.page('f.hbs', '<title>{{author}}</title>', {author: 'Halle Nicole'});
      template.page('g.md', '---\nauthor: Brian Woodward\n---\n<title>{{author}}</title>', {author: 'Halle Nicole'});
      template.page({path: 'with-partial.hbs', content: '{{partial "a.hbs" custom.locals}}'});

      template.render('a.hbs', {custom: {locals: {name: 'Halle Nicole' }}}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Halle Nicole</title>');
      });

      template.render('with-partial.hbs', {custom: {locals: {name: 'Halle Nicole' }}}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Halle Nicole</title>');
      });

      async.each(template.cache.pages, function (file, next) {
        var page = template.cache.pages[file];

        template.render(page, {custom: {locals: {name: 'Halle Nicole' }}}, function (err, content) {
          if (err) return next(err);
          content.should.equal('<title>Halle Nicole</title>');
          next(null);
        });
      });

      done();
    });
  });
});
