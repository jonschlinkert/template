/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('./app');
var template;

describe('.mergeType():', function () {
  beforeEach(function () {
    template = new Template();

    // create some template subtypes
    template.create('post', { isRenderable: true });
    template.create('doc', { isRenderable: true });
    template.create('block', { isLayout: true });
    template.create('include', { isPartial: true });

    // add some templates
    template.post('a', {content: 'a'});
    template.doc('b', {content: 'b'});
    template.page('c', {content: 'c'});

    template.layout('d', {content: 'd'});
    template.block('e', {content: 'e'});

    template.partial('f', {content: 'f'});
    template.include('g', {content: 'g'});
  });

  describe('should return an object with the `subtypes` for the given template `type`:', function () {
    it('should merge `renderable` subtypes:', function () {
      template.mergeType('renderable').should.have.properties('a', 'b', 'c');
    });

    it('should merge `layout` subtypes:', function () {
      template.mergeType('layout').should.have.properties('d', 'e');
    });

    it('should merge `partial` subtypes:', function () {
      template.mergeType('partial').should.have.properties('f', 'g');
    });

    it('should merge only the given subtypes:', function () {
      var templates = template.mergeType('renderable', ['posts', 'pages'])
      templates.should.have.properties('a', 'c');
      templates.should.not.have.properties('b');
    });

    it('should merge subtypes in the order specified in the array:', function () {
      var templates = template.mergeType('renderable', ['posts', 'pages']);
      Object.keys(templates).should.eql(['c', 'a']);
      Object.keys(templates).should.not.eql(['a', 'c']);
    });
  });
});
