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


describe('.render() synchronously:', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('when a string is passed to `.render()` without a callback:', function () {
    it('should render the string with the default engine:', function () {
      template.render('<%= name %>{{ name }}', {name: 'Jon Schlinkert'}).should.equal('Jon Schlinkert{{ name }}');
    });
    it('should render the string with the defined engine:', function () {
      template.engine('hbs', engines.handlebars);
      template.render('<%= name %>{{ name }}', {name: 'Jon Schlinkert', engine: 'hbs'}).should.equal('<%= name %>Jon Schlinkert');
    });
    it('should render the template with the specified engine:', function () {
      template.render('<%= name %>', {name: 'Jon Schlinkert', engine: 'lodash'}).should.equal('Jon Schlinkert')
    });
  });

  describe('when an object is passed to `.render()` without a callback:', function () {
    it('should determine the engine from the `path` on the given object:', function () {
      var file = {path: 'a/b/c.md', content: '<%= name %>', locals: {name: 'Jon Schlinkert'}};
      var content = template.render(file);
      content.should.equal('Jon Schlinkert');
    });

    it('should determine the engine from the `path` on the given object:', function () {
      var file = {path: 'a/b/c.md', content: '<%= name %>'};
      template.render(file, {name: 'Jon Schlinkert'}).should.equal('Jon Schlinkert');
    });
  });

  describe('when the name of a cached template is passed to `.render()`:', function () {
    it('should render the template with the detected engine:', function () {
      template.page('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});
      template.render('aaa.md').should.equal('Jon Schlinkert');
    });

    it('should render the template with the specified engine:', function () {
      template.page('aaa', '<%= name %>', {name: 'Jon Schlinkert', engine: 'lodash'});
      template.render('aaa').should.equal('Jon Schlinkert');
    });

    it('should render the first matching template if dupes are found:', function () {
      template.page('aaa.md', '<%= name %>', {name: 'Brian Woodward'});
      template.create('post', 'posts', { isRenderable: true });
      template.post('bbb.md', '<%= name %>', {name: 'Jon Schlinkert'});
      template.render('aaa.md').should.equal('Brian Woodward');
    });
  });

  describe('engine `.renderSync()`:', function () {
    it('should render content with an engine\'s render method.', function () {
      template.engine('hbs', engines.handlebars);
      var hbs = template.getEngine('hbs');

      hbs.renderSync('{{name}}', {name: 'Jon Schlinkert'}).should.equal('Jon Schlinkert');
    });

    it('should use `file.path` to determine the correct engine to render content:', function () {
      template.engine('hbs', engines.handlebars);
      template.engine('swig', engines.swig);
      template.engine('tmpl', engines.lodash);

      var files = [
        {path: 'fixture.hbs', content: '<title>{{author}}</title>', locals: {author: 'Jon Schlinkert'}},
        {path: 'fixture.tmpl', content: '<title><%= author %></title>', locals: {author: 'Jon Schlinkert'}},
        {path: 'fixture.swig', content: '<title>{{author}}</title>', locals: {author: 'Jon Schlinkert'}}
      ];

      files.forEach(function(file) {
        var content = template.render(file);
        content.should.equal('<title>Jon Schlinkert</title>');
      });
    });

    it('should use `path.extname()` on the key of a cached template to determine the engine to use:', function () {
      template.engine('hbs', engines.handlebars);
      template.engine('swig', engines.swig);
      template.engine('tmpl', engines.lodash);

      template.page('a.hbs', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});
      template.page('b.tmpl', '<title><%= author %></title>', {author: 'Jon Schlinkert'});
      template.page('d.swig', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});

      forOwn(template.views.pages, function (value, key) {
        template.render(key).should.equal('<title>Jon Schlinkert</title>');
      });
    });

    it('should use `ext` defined on locals to determine the engine to use:', function () {
      template.engine('hbs', engines.handlebars);
      template.engine('swig', engines.swig);
      template.engine('tmpl', engines.lodash);

      template.page('a', '<title>{{author}}</title>', {author: 'Jon Schlinkert', ext: 'hbs'});
      template.page('b', '<title><%= author %></title>', {author: 'Jon Schlinkert', ext: 'tmpl'});
      template.page('d', '<title>{{author}}</title>', {author: 'Jon Schlinkert', ext: 'swig'});

      forOwn(template.views.pages, function (value, key) {
        template.render(key).should.equal('<title>Jon Schlinkert</title>');
      });
    });

    it('should use `engine` defined on locals to determine the engine to use:', function () {
      template.engine('hbs', engines.handlebars);
      template.engine('swig', engines.swig);
      template.engine('tmpl', engines.lodash);

      template.page('a', '<title>{{author}}</title>', {author: 'Jon Schlinkert', engine: 'hbs'});
      template.page('b', '<title><%= author %></title>', {author: 'Jon Schlinkert', engine: 'tmpl'});
      template.page('d', '<title>{{author}}</title>', {author: 'Jon Schlinkert', engine: 'swig'});

      forOwn(template.views.pages, function (value, key) {
        template.render(key).should.equal('<title>Jon Schlinkert</title>');
      });
    });
  });
});
