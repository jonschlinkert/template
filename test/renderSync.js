/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var helpers = require('test-helpers')({dir: 'test'});
var engines = require('engines');
var Template = require('..');
var template = new Template();


describe('template render', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('when an un-cached string is passed to `.renderSync()`:', function () {
    it('should expose `this` to the .renderSync() method:', function () {
      var content = template.renderSync('<%= name %>', {name: 'Jon Schlinkert'}).should.equal('<%= name %>');
    });
  });

  describe('when an un-cached string is passed to `.renderSync()`:', function () {
    it('should render it with caching enabled:', function () {
      var content = template.renderSync('<%= name %>', {name: 'Jon Schlinkert', ext: '.html'});
      content.should.equal('Jon Schlinkert');
    });

    it('should render it with caching disabled:', function () {
      template.option('cache', false);

      var content = template.renderSync('<%= name %>', {name: 'Jon Schlinkert', ext: '.html'});
      content.should.equal('Jon Schlinkert');
    });
  });

  describe('when the name of a cached template is passed to `.renderSync()`:', function () {
    it('should get the template and render it:', function () {
      template.page('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});

      var content = template.renderSync('aaa.md');
      content.should.equal('Jon Schlinkert');
    });

    it('should render the first matching template is dupes are found:', function () {
      template.page('aaa.md', '<%= name %>', {name: 'Brian Woodward'});
      template.create('post', 'posts', { isRenderable: true });
      template.post('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});

      var content = template.renderSync('aaa.md');
      content.should.equal('Brian Woodward');
    });
  });

  describe('template render:', function () {
    it('should determine the engine from the `path` on the given object:', function () {
      var file = {path: 'a/b/c.md', content: '<%= name %>', name: 'Jon Schlinkert'};

      var content = template.renderSync(file);
      content.should.equal('Jon Schlinkert');
    });

    it('should determine the engine from the `path` on the given object:', function () {
      var file = {path: 'a/b/c.md', content: '<%= name %>'};

      var content = template.renderSync(file, {name: 'Jon Schlinkert'});
      content.should.equal('Jon Schlinkert');
    });
  });

  describe('engine render:', function () {
    // it.only('should render content with an engine from [engines].', function () {
    //   template.engine('hbs', engines.handlebars);
    //   var hbs = template.getEngine('hbs');

    //   hbs.renderSync('{{name}}', {name: 'Jon Schlinkert'}).should.equal('Jon Schlinkert');
    // });

    // it('should use `file.path` to determine the correct engines engine to render content:', function () {
    //   template.engine('hbs', engines.handlebars);
    //   template.engine('jade', engines.jade);
    //   template.engine('swig', engines.swig);
    //   template.engine('tmpl', engines.lodash);

    //   var files = [
    //     {path: 'fixture.hbs', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'},
    //     {path: 'fixture.tmpl', content: '<title><%= author %></title>', author: 'Jon Schlinkert'},
    //     {path: 'fixture.jade', content: 'title= author', author: 'Jon Schlinkert'},
    //     {path: 'fixture.swig', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'}
    //   ];

    //   files.forEach(function(file) {
    //     template.renderSync(file).should.equal('<title>Jon Schlinkert</title>');
    //   });
    // });

    // it('should use the key of a cached template to determine the engines engine to use:', function () {
    //   template.engine('hbs', engines.handlebars);
    //   template.engine('jade', engines.jade);
    //   template.engine('swig', engines.swig);
    //   template.engine('tmpl', engines.lodash);

    //   template.page('a.hbs', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});
    //   template.page('b.tmpl', '<title><%= author %></title>', {author: 'Jon Schlinkert'});
    //   template.page('c.jade', 'title= author', {author: 'Jon Schlinkert'});
    //   template.page('d.swig', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});

    //   Object.keys(template.cache.pages).forEach(function(page) {
    //     template.renderSync(page).should.equal('<title>Jon Schlinkert</title>');
    //   });
    // });
  });
});
