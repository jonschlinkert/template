/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

/* deps: swig */
require('should');
var async = require('async');
var assert = require('assert');
var forOwn = require('for-own');
var Template = require('./app');
var template;

var consolidate = require('consolidate');
var handlebars = require('engine-handlebars');

describe('renderable:', function () {
  describe('custom `renderable` types:', function () {
    beforeEach(function () {
      template = new Template();
      template.enable('preferLocals');
      template.enable('frontMatter');
    });

    it('should get the engine from the `file.path`:', function (done) {
      template.engine('hbs', handlebars);
      template.engine('md', handlebars);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      template.page({path: 'a.hbs', content: '<title>{{author}}</title>', locals: {author: 'Jon Schlinkert'}});
      template.page({path: 'b.tmpl', content: '<title><%= author %></title>', locals: {author: 'Jon Schlinkert'}});
      template.page({path: 'd.swig', content: '<title>{{author}}</title>', locals: {author: 'Jon Schlinkert'}});
      template.page({'e.swig': {content: '<title>{{author}}</title>', locals: {author: 'Jon Schlinkert'}}});
      template.page('f.hbs', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});
      template.page('g.md', '---\nauthor: Brian Woodward\n---\n<title>{{author}}</title>', {author: 'Jon Schlinkert'});

      forOwn(template.views.pages, function (value, key) {
        template.render(key, function (err, content) {
          if (err) console.log(err);
          content.should.equal('<title>Jon Schlinkert</title>');
        });
      });
      done();
    });

    it('should prefer template locals over front-matter data:', function (cb) {
      template.engine('hbs', handlebars);
      template.engine('md', handlebars);
      template.page('fixture.md', '---\nauthor: Brian Woodward\n---\n<title>{{author}}</title>', {
        author: 'Jon Schlinkert'
      });

      template.renderEach('pages', function (err, files) {
        if (err) console.log(err);
        files[0].content.should.equal('<title>Jon Schlinkert</title>');
        cb();
      });
    });
  });

  describe('when custom template types are passed to a built-in engine:', function () {
    beforeEach(function () {
      template = new Template();
      template.engine('md', require('engine-lodash'));
      template.enable('preferLocals');
      template.enable('frontMatter');
    });

    it('should render them with the `.render()` method:', function (cb) {
      template.create('post', { viewType: 'renderable' });
      template.create('include', { viewType: 'partial' });

      template.include('sidebar.md', '<nav>sidebar stuff...</nav>');
      template.post('2014-08-31.md', '---\nauthor: Brian Woodward\n---\n<title><%= author %></title>\n<%= include("sidebar.md") %>', {
        author: 'Jon Schlinkert'
      });

      template.render('2014-08-31.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Jon Schlinkert</title>\n<nav>sidebar stuff...</nav>');
        cb();
      });
    });
  });

  describe('when custom template types are passed to a non built-in engine:', function () {
    beforeEach(function () {
      template = new Template();
      template.enable('frontMatter');
      template.enable('preferLocals');
    });

    it('should render them with the `.render()` method:', function (cb) {
      template.engine('hbs', handlebars);
      template.engine('md', handlebars);

      template.create('post', { viewType: 'renderable' });
      template.create('include', { viewType: 'partial' });

      template.include('sidebar', '{{a}}', {a: 'bbbbbb'});
      template.post('2014-08-31.md', '---\nauthor: Brian Woodward\n---\n{{author}}\n{{> sidebar sidebar }}', {author: 'Jon Schlinkert'});

      template.renderEach('posts', function (err, files) {
        if (err) console.log(err);
        files[0].content.should.equal('Jon Schlinkert\nbbbbbb');
        cb();
      });
    });
  });

  describe('when custom template types are passed to a non built-in engine:', function () {
    beforeEach(function () {
      template = new Template();
      template.enable('preferLocals');
      template.enable('frontMatter');
    });

    it('should render them with the `.render()` method:', function (cb) {
      template.engine('hbs', handlebars);
      template.engine('md', handlebars);

      template.create('post', { viewType: 'renderable' });
      template.create('include', { viewType: 'partial' });

      template.include('sidebar', '{{a}}', {a: 'bbbbbb'});
      template.include('navbar', '{{a}}', {a: 'zzzzzz'});
      template.post('2014-08-31.md', '---\nauthor: Brian Woodward\n---\n{{author}}\n{{> sidebar navbar }}', {
        author: 'Jon Schlinkert'
      });

      template.renderEach('posts', function (err, files) {
        if (err) console.log(err);
        files[0].content.should.equal('Jon Schlinkert\nzzzzzz');
        cb();
      });
    });
  });
});
