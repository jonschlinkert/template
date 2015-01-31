/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var consolidate = require('consolidate');
var Template = require('..');
var template = new Template();


describe('template.compile()', function () {
  /* deps: swig */

  beforeEach(function () {
    template = new Template();
  });

  describe('when an un-cached string is passed to `.compile()`:', function () {
    it('should detect the engine from `ext` (with dot) on locals:', function () {
      template.compile('<%= name %>', {name: 'Jon Schlinkert', ext: '.html'}).should.eql('<%= name %>');
    });

    it('should detect the engine from `ext` (without dot) on locals:', function () {
      template.compile('<%= name %>', {name: 'Jon Schlinkert', ext: 'html'}).should.eql('<%= name %>');
    });

    it('should detect the engine from `engine` (with dot) on locals:', function () {
      template.compile('<%= name %>', {name: 'Jon Schlinkert', engine: '.html'}).should.eql('<%= name %>');
    });

    it('should detect the engine from `engine` (without dot) on locals:', function () {
      template.compile('<%= name %>', {name: 'Jon Schlinkert', engine: 'html'}).should.eql('<%= name %>');
    });
  });

  describe('when the name of a cached template is passed to `.compile()`:', function () {
    it('should find the template and compile it:', function () {
      template.page('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});
      template.compile('aaa.md').should.eql('<%= name %>');
    });

    it('should compile the first matching template if dupes are found:', function () {
      template.page('aaa.md', 'Page: <%= name %>', {name: 'Brian Woodward'});
      template.create('post', 'posts', { isRenderable: true });
      template.post('aaa.md', 'Post: <%= name %>', {name: 'Jon Schlinkert'});
      template.compile('aaa.md').should.eql('Page: <%= name %>');
    });
  });

  describe('engine compile:', function () {
    it('should determine the engine from the `path` on the given object:', function () {
      var file = {path: 'a/b/c.md', content: '<%= name %>', locals: {name: 'Jon Schlinkert'}};
      template.compile(file).should.eql('<%= name %>');
    });

    it('should determine the engine from the `path` on the given object:', function () {
      var file = {path: 'a/b/c.md', content: '<%= name %>'};
      template.compile(file, {name: 'Jon Schlinkert'}).should.eql('<%= name %>');
    });

    it('should compile content with an engine from [consolidate].', function () {
      template.engine('hbs', consolidate.handlebars);
      var hbs = template.getEngine('hbs');
      hbs.compile('{{name}}', {name: 'Jon Schlinkert'}).should.eql('{{name}}');
    });

    it('should use `file.path` to determine the correct consolidate engine to compile content:', function () {
      template.engine('hbs', consolidate.handlebars);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      var files = [
        {path: 'fixture.hbs', content: '<title>{{title}}</title>', locals: {title: 'Handlebars'}},
        {path: 'fixture.tmpl', content: '<title><%= title %></title>', locals: {title: 'Lo-Dash'}},
        {path: 'fixture.swig', content: '<title>{{title}}</title>', locals: {title: 'Swig'}}
      ];

      files.forEach(function(file) {
        var fn = template.compile(file);
        if (file.path === 'fixture.hbs') {
          fn.should.equal('<title>{{title}}</title>');
        }
        if (file.path === 'fixture.tmpl') {
          fn.should.equal('<title><%= title %></title>');
        }
        if (file.path === 'fixture.swig') {
          fn.should.equal('<title>{{title}}</title>');
        }
      });
    });

    it('should use the key of a cached template to determine the consolidate engine to use:', function () {
      template.engine('hbs', consolidate.handlebars);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      template.page('a.hbs', {content: '<title>{{title}}</title>', title: 'Handlebars'});
      template.page('b.tmpl', {content: '<title><%= title %></title>', title: 'Lo-Dash'});
      template.page('d.swig', {content: '<title>{{title}}</title>', title: 'Swig'});

      Object.keys(template.views.pages).forEach(function(file) {
        var fn = template.compile(file);
        if (file.path === 'fixture.hbs') {
          fn.should.equal('<title>{{title}}</title>');
        }
        if (file.path === 'fixture.tmpl') {
          fn.should.equal('<title><%= title %></title>');
        }
        if (file.path === 'fixture.swig') {
          fn.should.equal('<title>{{title}}</title>');
        }
      });
    });
  });

  describe('error handling and validation', function () {
    it('should throw error when template is not an object', function () {
      try {
        template.compileTemplate('foo');
        throw new Error('Expected an error');
      } catch (err) {
        if (!err) throw new Error('Expected an error');
      }
    });

    it('should throw error when content is undefined', function () {
      try {
        template.compile();
        throw new Error('Expected an error');
      } catch (err) {
        if (!err) throw new Error('Expected an error');
      }
    });

    it('should throw error when engine does not have a compile method', function () {
      try {
        var engine = {};
        template.compileBase(engine);
        throw new Error('Expected an error');
      } catch (err) {
        if (!err) throw new Error('Expected an error');
      }
    });

    it('should return error when engine.compile has an error', function () {
      try {
        var engine = {
          compile: function () {
            throw new Error('Error during compile.');
          }
        };
        var results = template.compileBase(engine);
        if (!(results instanceof Error)) throw new Error('Expected an error');
      } catch (err) {
        if (!err) throw new Error('Expected an error');
      }
    });
  });

  describe('no options', function () {
    it('should handle not having options', function () {
      template.compile('<%= name %>', false).should.eql('<%= name %>');
    });
  });
});
