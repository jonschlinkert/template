/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('./app');
var _ = require('lodash');
var template;

describe('template collection:', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('.collection():', function () {
    it('should create a new collection:', function () {
      template.collection('tag', 'tags');
      template.collections.should.have.property('tags');
    });
  });

  describe('override:', function () {
    it('should override default template subtype collections:', function () {
      // deafault
      template.collections.pages.options.forType.should.eql(['pages']);
      template.collections.pages.options.props.should.be.a.function;

      // override
      template.collection('page', 'pages', { forType: 'pages', props: ['tags'] });
      template.collections.should.have.property('pages');
      template.collections.pages.options.should.eql({ forType: ['pages'], props: ['tags'], plural: 'pages' });
    });
  });

  describe('when a new template type is created:', function () {
    it('should add a collection for that type:', function () {
      template.create('apple', 'apples');
      template.collections.should.have.property('apples');
    });

    it('should add all templates for a custom type to the custom collection', function () {
      template.create('apple', 'apples');
      template.apple('one', { path: 'one.hbs', content: 'this is the first apple' });
      template.apple('two', { path: 'two.hbs', content: 'this is the second apple' });
      template.apple('three', { path: 'three.hbs', content: 'this is the third apple' });
      template.apple('four', { path: 'four.hbs', content: 'this is the four apple' });
      template.apple('five', { path: 'five.hbs', content: 'this is the fifth apple' });
      Object.keys(template.collections.apples.related).length.should.eql(5);
    });
  });
});
