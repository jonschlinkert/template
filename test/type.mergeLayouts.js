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

describe('.mergeLayouts():', function () {
  beforeEach(function () {
    template = new Template();

    // create some template subtypes
    template.create('post', { isRenderable: true });
    template.create('doc', { isRenderable: true });
    template.create('block', { isLayout: true });
    template.create('section', { isLayout: true });
    template.create('include', { isPartial: true });

    // add some templates
    template.post('a', {content: 'a'});
    template.doc('b', {content: 'b'});
    template.page('c', {content: 'c'});

    template.layout('d', {content: 'd'});
    template.section('e', {content: 'e'});
    template.block('f', {content: 'f'});
  });

  describe('should return an object with the `subtypes` for the given template `type`:', function () {
    it('should merge `layout` subtypes:', function () {
      template.mergeLayouts().should.have.properties('d', 'e', 'f');
    });

    it('should merge the given `layout` subtypes:', function () {
      template.option('mergeLayouts', ['layouts']);
      template.mergeLayouts().should.have.properties('d');

      template.option('mergeLayouts', ['blocks']);
      template.mergeLayouts().should.have.properties('f');

      template.option('mergeLayouts', ['sections']);
      template.mergeLayouts().should.have.properties('e');
    });

    it('should merge multiple `layout` subtypes:', function () {
      template.option('mergeLayouts', ['layouts']);
      template.mergeLayouts().should.have.property('d');
      template.mergeLayouts().should.not.have.properties('e', 'f');

      template.option('mergeLayouts', ['blocks']);
      template.mergeLayouts().should.have.property('f');
      template.mergeLayouts().should.not.have.properties('d', 'e');

      template.option('mergeLayouts', ['sections']);
      template.mergeLayouts().should.have.property('e');
      template.mergeLayouts().should.not.have.properties('d', 'f');
    });

    it('should merge an array of `layout` subtypes:', function () {
      template.option('mergeLayouts', ['sections', 'blocks']);
      template.mergeLayouts().should.have.properties('e', 'f');
      template.mergeLayouts().should.not.have.property('d');
    });
  });

  describe('when a custom function is passed to the `mergeLayouts` option:', function () {
    it('should use it to merge collections:', function () {
      template.create('banana', {isLayout: true});
      template.create('apple', {isLayout: true});

      template.banana('aaa', {content: 'this is a banana'});
      template.apple('aaa', {content: 'this is an apple'});

      template.option('mergeLayouts', function(foo) {
        return this.mergeType('layout', ['apples', 'bananas']);
      });

      var res = template.mergeLayouts();
      res.should.have.property('aaa');
      res['aaa'].should.have.property('content', 'this is an apple');

      // change the order in the array

      template.option('mergeLayouts', function(foo) {
        return this.mergeType('layout', ['bananas', 'apples']);
      });
      res = template.mergeLayouts();
      res.should.have.property('aaa');
      res['aaa'].should.have.property('content', 'this is a banana');
    });
  });

  describe('when `false` is passed to the `mergeLayouts` option:', function () {
    it('should only return the `views.layouts` collection:', function () {
      template.option('mergeLayouts', false);
      template.mergeLayouts().should.have.property('d');
      template.mergeLayouts().should.not.have.properties('e', 'f');
    });
  });

  describe('when the `mergeLayouts` option is disabled:', function () {
    it('should only return the `views.layouts` collection:', function () {
      template.disable('mergeLayouts');
      template.mergeLayouts().should.have.property('d');
      template.mergeLayouts().should.not.have.properties('e', 'f');
    });
  });
});
