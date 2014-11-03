/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;

describe('.find...():', function () {
  beforeEach(function () {
    template = new Template();

    // create some layout subtypes
    template.create('block', { isLayout: true });
    template.create('section', { isLayout: true });

    template.create('post', { isRenderable: true });
    template.create('doc', { isRenderable: true });

    template.create('include', { isPartial: true });
    template.create('snippet', { isPartial: true });

    // register some actual templates, duplicates intentional
    template.post('a', {content: 'i\'m a post'});
    template.page('a', {content: 'i\'m a page'});
    template.doc('a', {content: 'i\'m a doc'});

    template.layout('d', {content: 'i\'m a layout'});
    template.block('d', {content: 'i\'m a block'});
    template.section('d', {content: 'i\'m a section'});

    template.include('i', {content: 'i\'m an include'});
    template.partial('i', {content: 'i\'m a partial'});
    template.snippet('i', {content: 'i\'m a snippet'});
  });

  describe('.findLayout():', function () {
    it('should return the first template with subtype `layout` that matches `name`:', function () {
      template.findLayout('d').should.have.property('content', 'i\'m a section');
    });

    it('should limit the search to the given subtypes:', function () {
      template.findLayout('d', ['blocks']).should.have.property('content', 'i\'m a block');
    });

    it('should thrown an error when the template is not found:', function () {
      (function () {
        template.findLayout('foo');
      }).should.throw('Cannot find layout: "foo"');
    });
  });

  describe('.findPartial():', function () {
    it('should return the first template with subtype `partial` that matches `name`:', function () {
      template.findPartial('i').should.have.property('content', 'i\'m a snippet');
    });

    it('should limit the search to the given subtypes:', function () {
      template.findPartial('i', ['includes']).should.have.property('content', 'i\'m an include');
    });
  });

  describe('.findRenderable():', function () {
    it('should return the first template with subtype `renderable` that matches `name`:', function () {
      template.findRenderable('a').should.have.property('content', 'i\'m a doc');
    });

    it('should limit the search to the given subtypes:', function () {
      template.findRenderable('a', ['posts']).should.have.property('content', 'i\'m a post');
    });
  });
});
