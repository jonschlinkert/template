/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var forOwn = require('for-own');
var Template = require('..');
var template;
var consolidate = require('consolidate');
var handlebars = require('engine-handlebars');

describe('custom `renderable` types:', function () {
  /* deps: swig */
  beforeEach(function () {
    template = new Template();
    template.option('preferLocals', true);
  });

  it('should use `file.path` to determine the correct consolidate engine to render content:', function (done) {
    template.engine('hbs', handlebars);
    template.engine('md', handlebars);
    template.engine('swig', consolidate.swig);
    template.engine('tmpl', consolidate.lodash);

    template.page({path: 'a.hbs', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});
    template.page({path: 'b.tmpl', content: '<title><%= author %></title>', author: 'Jon Schlinkert'});
    template.page({path: 'd.swig', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});
    template.page({'e.swig': {content: '<title>{{author}}</title>', author: 'Jon Schlinkert'}});
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

  it('should prefer template locals over front-matter data:', function (done) {
    template.engine('hbs', handlebars);
    template.engine('md', handlebars);
    template.page('fixture.md', '---\nauthor: Brian Woodward\n---\n<title>{{author}}</title>', {
      author: 'Jon Schlinkert'
    });

    forOwn(template.views.pages, function (value, key) {
      template.render(key, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Jon Schlinkert</title>');
      });
    });
    done();
  });

  describe('when custom template types are passed to a built-in engine:', function () {
    it('should render them with the `.render()` method:', function (done) {
      template.create('post', 'posts', { isRenderable: true });
      template.create('include', 'includes');

      template.include('sidebar.md', '<nav>sidebar stuff...</nav>');
      template.post('2014-08-31.md', '---\nauthor: Brian Woodward\n---\n<title><%= author %></title>\n<%= include("sidebar.md") %>', {
        author: 'Jon Schlinkert'
      });

      template.render('2014-08-31.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Jon Schlinkert</title>\n<nav>sidebar stuff...</nav>');
        done();
      });
    });
  });

  describe('when custom template types are passed to a non built-in engine:', function () {
    it('should render them with the `.render()` method:', function (done) {
      template.engine('hbs', handlebars);
      template.engine('md', handlebars);

      template.create('post', 'posts', { isRenderable: true });
      template.create('include', 'includes');

      template.include('sidebar', '{{sidebar.a}}', {a: 'bbbbbb'});
      template.post('2014-08-31.md', '---\nauthor: Brian Woodward\n---\n{{author}}\n{{> sidebar }}', {
        author: 'Jon Schlinkert'
      });

      forOwn(template.views.posts, function(value, key) {
        template.render(key, function (err, content) {
          if (err) console.log(err);
          content.should.equal('Jon Schlinkert\nbbbbbb');
        });
      });
      done();
    });
  });

  describe('when custom template types are passed to a non built-in engine:', function () {
    it('should render them with the `.render()` method:', function (done) {
      template.engine('hbs', handlebars);
      template.engine('md', handlebars);

      template.create('post', 'posts', { isRenderable: true });
      template.create('include', 'includes');

      template.include('sidebar', '{{a}}', {a: 'bbbbbb'});
      template.include('navbar', '{{a}}', {a: 'zzzzzz'});
      template.post('2014-08-31.md', '---\nauthor: Brian Woodward\n---\n{{author}}\n{{log this}}{{> sidebar navbar }}', {
        author: 'Jon Schlinkert'
      });

      forOwn(template.views.posts, function(value, key) {
        template.render(key, function (err, content) {
          console.log(template)
          if (err) console.log(err);
          content.should.equal('Jon Schlinkert\nzzzzzz');
        });
      });
      done();
    });
  });
});
