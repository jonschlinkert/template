/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var assert = require('assert');
var Template = require('./app');
var template;

describe('template collections', function() {
  beforeEach(function() {
    template = new Template();
  });

  it('should have templates of built-in collection `pages`:', function () {
    template.page('abc.md', '<%= abc %>');
    template.views.pages.should.be.an.object;
    template.views.pages.should.have.property('abc.md');
  });

  it('should have templates of custom collection `posts`:', function () {
    template.create('post', { viewType: 'renderable' });
    template.post('xyz.md', '<%= abc %>');
    template.views.posts.should.be.an.object;
    template.views.posts.should.have.property('xyz.md');
  });

  it('should have templates of built-in collection `partials`:', function () {
    template.partial('abc.md', '<%= abc %>');
    template.views.partials.should.be.an.object;
    template.views.partials.should.have.property('abc.md');
  });

  it('should have templates of custom collection `includes`:', function () {
    template.create('include', { viewType: 'partial' });
    template.include('xyz.md', '<%= abc %>');

    template.views.includes.should.be.an.object;
    template.views.includes.should.have.property('xyz.md');
  });

  it('should have templates of built-in collection `layouts`:', function () {
    template.layout('abc.md', '<%= abc %>');
    template.views.layouts.should.be.an.object;
    template.views.layouts.should.have.property('abc.md');
  });

  it('should have templates of custom collection `blocks`:', function () {
    template.create('block', { viewType: 'layout' });
    template.block('xyz.md', '<%= abc %>');

    template.views.blocks.should.be.an.object;
    template.views.blocks.should.have.property('xyz.md');
  });
});

describe('front matter', function () {
  beforeEach(function () {
    template = new Template();
    template.engine('md', require('engine-lodash'));
    template.enable('frontMatter');
  });

  describe('when a partial has a layout defined:', function () {
    it('should use render', function () {
      template.layout('default.md', 'bbb{% body %}bbb');
      template.layout('href.md', '<a href="{% body %}"><%= text %></a>');
      template.partials('link.md', '---\nlayout: href.md\ntext: Jon Schlinkert\n---\nhttps://github.com/jonschlinkert', {a: 'b'});
      template.page('home.md', '---\nname: Home Page\nlayout: default.md\n---\nThis is home page content.\n<%= partial("link.md", {c: "d"}) %>');
      var content = template.render('home.md');
      content.should.equal('bbbThis is home page content.\n<a href="https://github.com/jonschlinkert">Jon Schlinkert</a>bbb');
    });

    it('should use render.', function (done) {
      template.layout('default.md', 'bbb{% body %}bbb');
      template.layout('href.md', '<a href="{% body %}"><%= text %></a>');
      template.partials('link.md', '---\nlayout: href.md\ntext: Jon Schlinkert\n---\nhttps://github.com/jonschlinkert', {a: 'b'});
      template.page('home.md', '---\nname: Home Page\nlayout: default.md\n---\nThis is home page content.\n<%= partial("link.md", {c: "d"}) %>');
      template.render('home.md', function (err, content) {
        if (err) return done(err);
        content.should.equal('bbbThis is home page content.\n<a href="https://github.com/jonschlinkert">Jon Schlinkert</a>bbb');
        done();
      });
    });
  });
});