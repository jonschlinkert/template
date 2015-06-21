/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var consolidate = require('consolidate');
var engines = require('engines');
var Template = require('./app');
var template;
var str;

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
    template.engine(['tmpl', 'foo', 'md'], require('engine-lodash'));

    // create a custom template type
    template.create('doc', { viewType: 'renderable', engine: '.tmpl'});

    // default content to use on all tests
    str = '<title>{{title}}<%= title %></title>'

    // add some pages
    template.page('aaa.hbs', {content: str, title: 'Handlebars'});
    template.page('bbb.tmpl', {content: str, title: 'Lo-Dash'});
  });

  describe('.create():', function() {
    describe('when an engine is defined in the .create() method options:', function() {
      it('should prefer the create-method defined on `view engine` over others:', function() {
        template.option('view engine', '.tmpl');
        template.page('a.hbs', {content: str, engine: '.tmpl'});
        template.page('b.tmpl', {content: str, engine: '.hbs'});
        template.render('a.hbs').should.equal('<title>{{title}}RENDERED</title>');
        template.render('b.tmpl').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use the create-method engine on templates:', function() {
        template.doc('doc-a', {content: str});
        template.render('doc-a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer engine on templates over engine defined on create:', function() {
        template.doc('doc-a', {content: str, options: {engine: '.hbs'}});
        template.views.docs['doc-a'].should.have.property('engine', '.hbs');
        template.render('doc-a').should.equal('<title>RENDERED<%= title %></title>');
      });

      it('should prefer `engine` defined on templates over the create-method engine:', function() {
        template.doc('doc-a', {content: str,  engine: '.hbs'});
        template.render('doc-a').should.equal('<title>RENDERED<%= title %></title>');
      });

      it('should prefer the create-method engine over `engine` defined on template locals:', function() {
        template.doc('doc-a', {content: str, locals: {engine: '.hbs'}});
        template.views.docs['doc-a'].locals.should.have.property('engine', '.hbs');
        template.render('doc-a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer `engine` defined on template options over the create-method engine:', function() {
        template.doc('doc-a', {content: str, options: {engine: '.hbs'}});
        template.views.docs['doc-a'].contexts.should.have.property('create');
        template.views.docs['doc-a'].contexts.create.should.have.property('engine', '.tmpl');
        template.render('doc-a').should.equal('<title>RENDERED<%= title %></title>');
      });
    });
  });

  describe('when a built-in engine is specified:', function() {
    describe('render sync (uses `engines` lib):', function() {
      it('should use the `engine` property defined on the template options.', function() {
        template.page('a', {content: str, options: {engine: '.hbs'}});
        template.render('a').should.equal('<title>RENDERED<%= title %></title>');
        template.views.pages.a.options.should.have.property('engine', '.hbs');
        template.views.pages.a.should.have.property('engine', '.hbs');
      });

      it('should use the `engine` property defined on the template options.', function() {
        template.page('a', {content: str, options: {engine: '.hbs'}});
        template.views.pages.a.options.should.have.property('engine', '.hbs');
        template.render('a').should.equal('<title>RENDERED<%= title %></title>');
      });

      it('should use the `engine` from the options.', function() {
        template.page('a', {content: str}, {a: 'b'}, {engine: '.tmpl'});
        template.views.pages.a.options.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use the engine defined on a template object.', function() {
        template.page('a', {content: str, engine: '.tmpl'});
        template.views.pages.a.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use the `engine` defined on the options.', function() {
        template.page('a', {content: str}, {a: 'b'}, {engine: '.tmpl'});
        template.views.pages.a.options.should.have.properties(['engine']);
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer `engine` defined on the template over `engine` on options.', function() {
        template.page('a', {content: str, engine: '.tmpl', options: {engine: '.hbs'}});
        template.views.pages.a.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should prefer `engine` defined on the template over `ext` on options.', function() {
        template.page('a', {content: str, engine: '.tmpl', options: {engine: '.hbs'}});
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
        template.views.pages.a.should.have.property('engine', '.tmpl');
      });

      it('should get the engine from `path.extname()` on the template key.', function() {
        template.page('a.tmpl', {content: str});
        template.render('a.tmpl').should.equal('<title>{{title}}RENDERED</title>');
        template.views.pages['a.tmpl'].should.have.property('engine', '.tmpl');
      });

      it('should prefer `engine` on locals over `ext` from using `path.extname()` on the template key.', function() {
        template.page('a.hbs', {content: str, engine: '.tmpl'});
        template.page('b.tmpl', {content: str, engine: '.hbs'});
        template.render('a.hbs').should.equal('<title>{{title}}RENDERED</title>');
        template.render('b.tmpl').should.equal('<title>RENDERED<%= title %></title>');
      });

      it('should use `path.extname()` on the template `path` property.', function(done) {
        template.page('a', {path: 'a.md', content: str});
        template.views.pages.a.should.have.property('path', 'a.md');
        template.render('a', function (err, content) {
          if (err) console.log(err);
          content.should.equal('<title>{{title}}RENDERED</title>');
          done()
        });
      });

      it('should use `engine` defined on options.', function(done) {
        template.page('a', {content: str}, {engine: '.tmpl'});
        template.render('a', function (err, content) {
          if (err) console.log(err);
          template.views.pages.a.locals.engine.should.equal('.tmpl');
          content.should.equal('<title>{{title}}RENDERED</title>');
          done();
        });
      });

      it('should use `engine` defined on options.', function() {
        template.page('a', {content: str}, {engine: '.tmpl'});
        template.views.pages.a.locals.should.have.property('engine', '.tmpl');
        template.render('a').should.equal('<title>{{title}}RENDERED</title>');
      });

      it('should use the engine defined in `.create()` method options.', function() {
        template.engine('fez', engines.handlebars);
        template.engine('bang', engines.lodash);

        template.create('include', {engine: '.bang', viewType: 'renderable' });
        template.create('doc', {engine: '.fez', viewType: 'renderable' });

        template.include('aaa', {content: str});
        template.doc('bbb', {content: str});

        template.views.includes['aaa'].contexts.should.have.property('create');
        template.views.includes['aaa'].contexts.create.should.have.property('engine', '.bang');
        template.views.docs['bbb'].contexts.should.have.property('create');
        template.views.docs['bbb'].contexts.create.should.have.property('engine', '.fez');

        template.render('aaa').should.equal('<title>{{title}}RENDERED</title>');
        template.render('bbb').should.equal('<title>RENDERED<%= title %></title>');
      });
    });

    describe('render async (uses `consolidate` lib):', function() {
      it('should use the `engine` property defined on the template options.', function() {
        template.page('b', {content: str, options: {engine: 'handlebars'}});
        template.render('b', function (err, content) {
          if (err) console.log(err);
          content.should.equal('<title>RENDERED<%= title %></title>');
        });
      });
    });
  });
});
