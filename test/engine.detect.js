/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
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
  /* deps: swig */

  beforeEach(function () {
    template = new Template();

    // load some data
    template.data({title: 'RENDERED'})

    // define sync engines
    template.engine('handlebars', consolidate.handlebars);
    template.engine('hbs', engines.handlebars);

    // define async engines
    template.engine('swig', engines.swig);
    template.engine(['tmpl', 'foo'], engines.lodash);

    // create a custom template type
    template.create('doc', { isRenderable: true, engine: 'tmpl'});

    // default content to use on all tests
    content = '<title>{{title}}<%= title %></title>'

    // add some pages
    template.page('aaa.hbs', {content: content, title: 'Handlebars'});
    template.page('bbb.tmpl', {content: content, title: 'Lo-Dash'});
  });

  describe('.create():', function() {
    describe('when an engine is defined in the .create() method options:', function() {
      it('should use the create-method engine on templates:', function() {
        template.doc('doc-a', {content: content});
        template.render('doc-a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer the create-method engine over `ext` defined on templates:', function() {
        template.doc('doc-a', {content: content, options: {ext: '.hbs'}});
        template.views.docs['doc-a'].should.have.property('ext', '.hbs');
        template.render('doc-a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer the create-method engine over `engine` defined on templates:', function() {
        template.doc('doc-a', {content: content,  engine: '.hbs'});
        template.render('doc-a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer the create-method engine over `engine` defined on template locals:', function() {
        template.doc('doc-a', {content: content, locals: {engine: '.hbs'}});
        template.views.docs['doc-a'].locals.should.have.property('engine', '.hbs');
        template.render('doc-a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer the create-method engine over `engine` defined on template options:', function() {
        template.doc('doc-a', {content: content, options: {engine: '.hbs'}});
        template.views.docs['doc-a'].options.should.have.property('engine', '.hbs');
        template.render('doc-a').should.equal('<title>{{title}}RENDERED</title>');
      });
    });
  });


  describe('when a built-in engine is specified:', function() {
    describe('render sync (uses `engines` lib):', function() {
      it('should use the `ext` property defined on the template options.', function() {
        template.page('a', {content: content, options: {ext: '.hbs'}});
        template.views.pages['a'].should.have.property('ext', '.hbs');
        template.render('a').should.equal('<title>RENDERED<%= title %></title>');
      });

      it('should use the `engine` property defined on the template options.', function() {
        template.page('a', {content: content, options: {engine: '.hbs'}});
        template.views.pages['a'].options.should.have.property('engine', '.hbs');
        template.render('a').should.equal('<title>RENDERED<%= title %></title>');
      });

      it('should use the `ext` from the options.', function() {
        template.page('a', {content: content}, {a: 'b'}, {ext: '.tmpl'});
        template.views.pages['a'].options.should.have.property('ext', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer `engine` over `ext` defined on the options.', function() {
        template.page('a', {content: content}, {a: 'b'}, {ext: '.hbs', engine: '.tmpl'});
        template.views.pages['a'].options.should.have.properties(['ext', 'engine']);
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use the `engine` property defined directly on the template object.', function() {
        template.page('a', {content: content, engine: '.tmpl'});
        template.views.pages['a'].locals.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer `engine` defined on the template over `engine` on options.', function() {
        template.page('a', {content: content, engine: '.tmpl', options: {engine: '.hbs'}});
        template.views.pages['a'].locals.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer `engine` defined on the template over `ext` on options.', function() {
        template.page('a', {content: content, engine: '.tmpl', options: {ext: '.hbs'}});
        template.views.pages['a'].locals.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should get the engine from using `path.extname()` on the template key.', function() {
        template.page('a.tmpl', {content: content});
        template.views.pages['a.tmpl'].should.have.property('ext', '.tmpl');
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
        template.views.pages['a'].should.have.property('ext', '.md');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use `ext` defined on options.', function() {
        template.page('a', {content: content}, {ext: '.tmpl'});
        template.views.pages['a'].should.have.property('ext', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use `engine` defined on options.', function() {
        template.page('a', {content: content}, {engine: '.tmpl'});
        template.views.pages['a'].options.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use the engine defined in `.create()` method options.', function() {
        template.engine('fez', engines.handlebars);
        template.engine('bang', engines.lodash);

        template.create('include', 'includes', {engine: '.bang', isRenderable: true });
        template.create('doc', 'docs', {engine: '.fez', isRenderable: true });

        template.include('aaa', {content: content});
        template.doc('bbb', {content: content});

        template.views.includes['aaa'].options.should.have.property('engine', '.bang');
        template.views.docs['bbb'].options.should.have.property('engine', '.fez');

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
