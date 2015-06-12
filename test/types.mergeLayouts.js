/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var Template = require('./app');
var template;

describe('.mergeLayouts():', function () {
  beforeEach(function () {
    template = new Template();

    // create some template subtypes
    template.create('post', { viewType: 'renderable' });
    template.create('doc', { viewType: 'renderable' });
    template.create('block', { viewType: 'layout' });
    template.create('section', { viewType: 'layout' });
    template.create('include', { viewType: 'partial' });

    // add some templates
    template.post('a', {content: 'a'});
    template.doc('b', {content: 'b'});
    template.page('c', {content: 'c'});

    template.layout('d', {content: 'd'});
    template.section('e', {content: 'e'});
    template.block('f', {content: 'f'});
  });

  describe('should return an object with `subtypes` for the given `type`:', function () {
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

    describe('should only return `views.layouts`:', function () {
      it('when false is passed on the mergeLayouts option:', function () {
        template.option('mergeLayouts', false);
        var res = template.mergeLayouts();
        res.should.have.property('d');
        res.should.not.have.properties('e', 'f');
      });

      it('when disabled', function () {
        template.disable('mergeLayouts');
        var res = template.mergeLayouts();
        res.should.have.property('d');
        res.should.not.have.properties('e', 'f');
      });
    });
  });

  describe('custom `mergeLayouts` function:', function () {
    beforeEach(function () {
      template = new Template();
      template.create('banana', { viewType: 'layout' });
      template.create('apple', { viewType: 'layout' });

      template.apple('aaa', {content: 'this is an apple'});
      template.banana('aaa', {content: 'this is a banana'});
    });

    it('should use a custom function passed on the `mergeLayouts` method:', function () {
      var res = template.mergeLayouts(function() {
        return this.mergeType('layout', ['apples', 'bananas']);
      });

      res.should.have.property('aaa');
      res['aaa'].should.have.property('content', 'this is an apple');
    });

    it('should reverse the order in the array:', function () {
      var res = template.mergeLayouts(function() {
        return this.mergeType('layout', ['bananas', 'apples']);
      });

      res.should.have.property('aaa');
      res['aaa'].should.have.property('content', 'this is a banana');
    });
  });

  describe('custom `mergeLayouts` function passed on options:', function () {
    beforeEach(function () {
      template = new Template();
      template.create('banana', { viewType: 'layout' });
      template.create('apple', { viewType: 'layout' });

      template.apple('aaa', {content: 'this is an apple'});
      template.banana('aaa', {content: 'this is a banana'});
    });

    it('should use a custom function passed on the options:', function () {
      template.option('mergeLayouts', function() {
        return this.mergeType('layout', ['apples', 'bananas']);
      });

      var res = template.mergeLayouts();
      res.should.have.property('aaa');
      res['aaa'].should.have.property('content', 'this is an apple');
    });

    it('should reverse the order in the array:', function () {
      template.option('mergeLayouts', function() {
        return this.mergeType('layout', ['apples', 'bananas']);
      });

      var res = template.mergeLayouts();
      res.should.have.property('aaa');
      res['aaa'].should.have.property('content', 'this is an apple');
    });
  });
});
