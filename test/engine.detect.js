/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var should = require('should');
var consolidate = require('consolidate');
var engines = require('engines');
var Template = require('..');
var template;
var content;


describe('detect engine', function() {
  beforeEach(function () {
    template = new Template();
    template.data({title: 'RENDERED'})
    template.engine('handlebars', consolidate.handlebars);
    template.engine('hbs', engines.handlebars);
    template.engine('swig', engines.swig);
    template.engine(['tmpl', 'foo'], engines.lodash);

    content = '<title>{{title}}<%= title %></title>'

    template.page('aaa.hbs', {content: content, title: 'Handlebars'});
    template.page('bbb.tmpl', {content: content, title: 'Lo-Dash'});
  });


  describe('when a built-in engine is specified:', function() {
    describe('render sync (uses `engines` lib):', function() {
      it('should use the `ext` property defined on the template options.', function() {
        template.page('a', {content: content, options: {ext: '.hbs'}});
        template.cache.pages['a'].should.have.property('ext', '.hbs');
        template.render('a').should.equal('<title>RENDERED<%= title %></title>');
      });

      it('should use the `engine` property defined on the template options.', function() {
        template.page('a', {content: content, options: {engine: '.hbs'}});
        template.cache.pages['a'].options.should.have.property('engine', '.hbs');
        template.render('a').should.equal('<title>RENDERED<%= title %></title>');
      });

      it('should use the `ext` from the options.', function() {
        template.page('a', {content: content}, {a: 'b'}, {ext: '.tmpl'});
        template.cache.pages['a'].options.should.have.property('ext', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer `engine` over `ext` defined on the options.', function() {
        template.page('a', {content: content}, {a: 'b'}, {ext: '.hbs', engine: '.tmpl'});
        template.cache.pages['a'].options.should.have.properties(['ext', 'engine']);
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use the `engine` property defined directly on the template object.', function() {
        template.page('a', {content: content, engine: '.tmpl'});
        template.cache.pages['a'].locals.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer `engine` defined on the template over `engine` on options.', function() {
        template.page('a', {content: content, engine: '.tmpl', options: {engine: '.hbs'}});
        template.cache.pages['a'].locals.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer `engine` defined on the template over `ext` on options.', function() {
        template.page('a', {content: content, engine: '.tmpl', options: {ext: '.hbs'}});
        template.cache.pages['a'].locals.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should get the engine from using `path.extname()` on the template key.', function() {
        template.page('a.tmpl', {content: content});
        template.cache.pages['a.tmpl'].should.have.property('ext', '.tmpl');
        template.render('a.tmpl').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer `ext` on locals over `ext` from using `path.extname()` on the template key.', function() {
        template.page('a.hbs', {content: content, ext: '.tmpl'});
        template.page('b.tmpl', {content: content, ext: '.hbs'});
        template.render('a.hbs').should.equal('<title>{{title}}RENDERED</title>');
        template.render('b.tmpl').should.equal('<title>RENDERED<%= title %></title>');
      });

      it('should use `path.extname()` on the template `path` property.', function() {
        template.page('a', {path: 'a.md', content: content});
        template.cache.pages['a'].should.have.property('ext', '.md');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use `ext` defined on options.', function() {
        template.page('a', {content: content}, {ext: '.tmpl'});
        template.cache.pages['a'].should.have.property('ext', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use `engine` defined on options.', function() {
        template.page('a', {content: content}, {engine: '.tmpl'});
        template.cache.pages['a'].options.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use the engine defined in `.create()` method options.', function() {
        template.engine('fez', engines.handlebars);
        template.engine('bang', engines.lodash);

        template.create('include', 'includes', {engine: '.bang', isRenderable: true });
        template.create('doc', 'docs', {engine: '.fez', isRenderable: true });

        template.include('aaa', {content: content});
        template.doc('bbb', {content: content});

        template.cache.includes['aaa'].options.should.have.property('engine', '.bang');
        template.cache.docs['bbb'].options.should.have.property('engine', '.fez');

        template.render('aaa').should.equal('<title>{{title}}RENDERED</title>');
        template.render('bbb').should.equal('<title>RENDERED<%= title %></title>');
      });
    });

    describe('render async (uses `consolidate` lib):', function() {
      it('should use the `ext` property defined on the template options.', function() {
        template.page('b', {content: content, options: {engine: 'handlebars'}});
        template.render('b', function (err, content) {
          if (err) console.log(err);
          content.should.equal('<title>RENDERED<%= title %></title>');
        });
      });
    });
  });
});
