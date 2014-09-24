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
var consolidate = require('consolidate');
var Template = require('../tmpl');
var template = new Template();


describe('template render', function () {
  beforeEach(function (done) {
    template = new Template();
    done();
  });


  describe.skip('when an un-cached string is passed to `.render()`:', function () {
    it('should expose `this` to the .render() method:', function (done) {
      template.render('<%= name %>', {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) console.log(err);
        this.should.have.property('cache');
        this.should.have.property('engines');
        this.should.have.property('parsers');
        this.should.have.property('delims');
        this.should.have.property('options');
        done();
      });
    });
  });

  describe('when an un-cached string is passed to `.render()`:', function () {
    it('should render it with caching enabled:', function (done) {
      template.render('<%= name %>', {name: 'Jon Schlinkert', ext: '.html'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should render it with caching disabled:', function (done) {
      template.option('cache', false);

      template.render('<%= name %>', {name: 'Jon Schlinkert', ext: '.html'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });
  });

  describe('when the name of a cached template is passed to `.render()`:', function () {
    it('should get the template and render it:', function (done) {
      template.page('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});

      template.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should render the first matching template is dupes are found:', function (done) {
      template.page('aaa.md', '<%= name %>', {name: 'Brian Woodward'});
      template.create('post', 'posts', {renderable: true});
      template.post('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});

      template.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('Brian Woodward');
        done();
      });
    });
  });

  describe('template render:', function () {
    it('should determine the engine from the `path` on the given object:', function (done) {
      var file = {path: 'a/b/c.md', content: '<%= name %>', name: 'Jon Schlinkert'};

      template.render(file, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should determine the engine from the `path` on the given object:', function (done) {
      var file = {path: 'a/b/c.md', content: '<%= name %>'};

      template.render(file, {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should render content with an engine from [consolidate].', function (done) {
      template.engine('hbs', consolidate.handlebars);
      var hbs = template.engine('hbs');

      hbs.render('{{name}}', {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should use `file.path` to determine the correct consolidate engine to render content:', function (done) {
      template.engine('hbs', consolidate.handlebars);
      template.engine('jade', consolidate.jade);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      var files = [
        {path: 'fixture.hbs', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'},
        {path: 'fixture.tmpl', content: '<title><%= author %></title>', author: 'Jon Schlinkert'},
        {path: 'fixture.jade', content: 'title= author', author: 'Jon Schlinkert'},
        {path: 'fixture.swig', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'}
      ];

      files.forEach(function(file) {
        template.render(file, function (err, content) {
          if (err) console.log(err);
          content.should.equal('<title>Jon Schlinkert</title>');
        });
      });

      done();
    });

    it('should use the key of a cached template to determine the consolidate engine to use:', function (done) {
      template.engine('hbs', consolidate.handlebars);
      template.engine('jade', consolidate.jade);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      template.page('a.hbs', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});
      template.page('b.tmpl', '<title><%= author %></title>', {author: 'Jon Schlinkert'});
      template.page('c.jade', 'title= author', {author: 'Jon Schlinkert'});
      template.page('d.swig', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});

      Object.keys(template.cache.pages).forEach(function(page) {
        template.render(page, function (err, content) {
          if (err) console.log(err);
          content.should.equal('<title>Jon Schlinkert</title>');
        });
      });
      done();
    });
  });
});
