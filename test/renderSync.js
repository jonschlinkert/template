/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var forOwn = require('for-own');
var engines = require('engines');
var Template = require('..');
var template = new Template();


describe('.renderSync()', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('when an un-cached string is passed to `.renderSync()`:', function () {
    it('should expose `this` to the .renderSync() method:', function () {
      template.renderSync('<%= name %>', {name: 'Jon Schlinkert'}).should.equal('<%= name %>');
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
      template.renderSync('aaa.md').should.equal('Jon Schlinkert');
    });

    it('should render the first matching template is dupes are found:', function () {
      template.page('aaa.md', '<%= name %>', {name: 'Brian Woodward'});
      template.create('post', 'posts', { isRenderable: true });
      template.post('bbb.md', '<%= name %>', {name: 'Jon Schlinkert'});
      template.renderSync('aaa.md').should.equal('Brian Woodward');
    });
  });

  describe('engine render:', function () {
    it('should determine the engine from the `path` on the given object:', function () {
      var file = {path: 'a/b/c.md', content: '<%= name %>', name: 'Jon Schlinkert'};
      var content = template.renderSync(file);
      content.should.equal('Jon Schlinkert');
    });

    it('should determine the engine from the `path` on the given object:', function () {
      var file = {path: 'a/b/c.md', content: '<%= name %>'};
      template.renderSync(file, {name: 'Jon Schlinkert'}).should.equal('Jon Schlinkert');
    });
  });

  describe('engine render:', function () {
    it('should render content with an engine from [engines].', function () {
      template.engine('hbs', engines.handlebars);
      var hbs = template.getEngine('hbs');

      hbs.renderSync('{{name}}', {name: 'Jon Schlinkert'}).should.equal('Jon Schlinkert');
    });

    it('should use `file.path` to determine the correct engine to render content:', function () {
      template.engine('hbs', engines.handlebars);
      template.engine('swig', engines.swig);
      template.engine('tmpl', engines.lodash);

      var files = [
        {path: 'fixture.hbs', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'},
        {path: 'fixture.tmpl', content: '<title><%= author %></title>', author: 'Jon Schlinkert'},
        {path: 'fixture.swig', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'}
      ];

      files.forEach(function(file) {
        var content = template.renderSync(file);
        content.should.equal('<title>Jon Schlinkert</title>');
      });
    });

    it('should use the key of a cached template to determine the engines engine to use:', function () {
      template.engine('hbs', engines.handlebars);
      template.engine('swig', engines.swig);
      template.engine('tmpl', engines.lodash);

      template.page('a.hbs', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});
      template.page('b.tmpl', '<title><%= author %></title>', {author: 'Jon Schlinkert'});
      template.page('d.swig', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});

      forOwn(template.cache.pages, function (value, key) {
        template.renderSync(key).should.equal('<title>Jon Schlinkert</title>');
      });
    });
  });
});
