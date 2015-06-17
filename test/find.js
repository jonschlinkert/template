/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
require('should');
var Template = require('./app');
var template;

describe('.find...():', function () {
  beforeEach(function () {
    template = new Template();

    // create some layout subtypes
    template.create('block', { viewType: 'layout' });
    template.create('section', { viewType: 'layout' });

    template.create('post', { viewType: 'renderable' });
    template.create('doc', { viewType: 'renderable' });

    template.create('include', { viewType: 'partial' });
    template.create('snippet', { viewType: 'partial' });

    // register some actual templates, duplicates intentional
    template.page('a', {content: 'i\'m a page'});
    template.post('a', {content: 'i\'m a post'});
    template.doc('a', {content: 'i\'m a doc'});

    template.layout('d', {content: 'i\'m a layout'});
    template.block('d', {content: 'i\'m a block'});
    template.section('d', {content: 'i\'m a section'});

    template.partial('i', {content: 'i\'m a partial'});
    template.include('i', {content: 'i\'m an include'});
    template.snippet('i', {content: 'i\'m a snippet'});
  });

  describe('find:', function () {
    it('should get the first template of the type `renderable` by default:', function () {
      template.create('post', { viewType: 'renderable' });
      template.page('aaa.md', '<%= abc %>');
      template.post('aaa.md', '<%= abc %>');
      template.findRenderable('aaa.md').should.have.property('contexts');
      template.findRenderable('aaa.md').contexts.should.have.property('create');
      template.findRenderable('aaa.md').contexts.create.should.have.properties([
        'loaderType',
        'lastLoader',
        'viewType',
        'collection',
        'inflection',
      ]);
      template.findRenderable('aaa.md', ['posts']).should.have.property('contexts');
    });

    it('should get the first template of the given collection:', function () {
      template.create('include', { viewType: 'partial' });
      template.partial('aaa.md', '<%= abc %>');
      template.include('aaa.md', '<%= abc %>');

      template.findPartial('aaa.md', ['partials']).should.have.property('contexts');
      template.findPartial('aaa.md', ['partials']).contexts.should.have.property('create');
      template.findPartial('aaa.md', ['partials']).contexts.create.should.have.properties([
        'loaderType',
        'lastLoader',
        'viewType',
        'collection',
        'inflection',
      ]);
    });

    it('should get the first template based on the order of the passed array:', function () {
      template.create('include', { viewType: 'partial' });
      template.create('snippet', { viewType: 'partial' });

      template.partial('aaa.md', '<%= abc %>');
      template.include('aaa.md', '<%= abc %>');
      template.snippet('aaa.md', '<%= abc %>');

      template.findPartial('aaa.md', ['partials', 'snippets', 'includes']).should.have.property('content');

      var snippets = ['snippets', 'partials', 'includes'];
      template.findPartial('aaa.md', snippets).should.have.property('content');
    });
  });

  describe('.findLayout():', function () {
    it('should return `null` when a template is not found:', function () {
      assert(template.findLayout('foo') === null);
    });
    it('should return the first template with subtype `layout` that matches `name`:', function () {
      template.findLayout('d').should.have.property('content', 'i\'m a layout');
    });

    it('should limit the search to the given subtypes:', function () {
      template.findLayout('d', ['blocks']).should.have.property('content', 'i\'m a block');
    });
  });

  describe('.findPartial():', function () {
    it('should return the first template with subtype `partial` that matches `name`:', function () {
      template.findPartial('i').should.have.property('content', 'i\'m a partial');
    });

    it('should limit the search to the given subtypes:', function () {
      template.findPartial('i', ['includes']).should.have.property('content', 'i\'m an include');
    });
  });

  describe('.findRenderable():', function () {
    it('should return the first template with subtype `renderable` that matches `name`:', function () {
      template.findRenderable('a').should.have.property('content', 'i\'m a page');
    });

    it('should limit the search to the given subtypes:', function () {
      template.findRenderable('a', ['posts']).should.have.property('content', 'i\'m a post');
    });
  });
});
