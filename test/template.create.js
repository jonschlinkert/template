/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var _ = require('lodash');


describe('template create:', function () {
  describe('.create():', function () {
    it('should create a new template `type`:', function () {
      var template = new Template();
      template.create('include', 'includes');

      template.should.have.property('include');
      template.should.have.property('includes');
    });
  });

  describe('when a new template type is created:', function () {
    it('should add templates registered for that type to its corresponding (plural) object on the cache:', function () {
      var template = new Template();
      template.create('apple', 'apples');

      template.apple('a', 'one');
      template.apple('b', 'two');
      template.apple('c', 'three');

      Object.keys(template.cache.apples).length.should.equal(3);
    });
  });

  describe('when the `isRenderable` flag is set on the options:', function () {
    it('should push the name of the type into the `isRenderable` array on the cache:', function () {
      var template = new Template();
      template.create('apple', 'apples', { isRenderable: true });

      _.contains(template.templateType.renderable, 'pages').should.be.true;
      _.contains(template.templateType.renderable, 'apples').should.be.true;
    });
  });

  describe('when the `isLayout` flag is set on the options:', function () {
    it('should push the name of the type into the `isLayout` array on the cache:', function () {
      var template = new Template();
      template.create('orange', 'oranges', { isLayout: true });

      _.contains(template.templateType.layout, 'layouts').should.be.true;
      _.contains(template.templateType.layout, 'oranges').should.be.true;
    });
  });

  describe('when no type flag is set on the options:', function () {
    it('should push the name of the type into the `isPartial` array on the cache:', function () {
      var template = new Template();
      template.create('banana', 'bananas');

      _.contains(template.templateType.partial, 'partials').should.be.true;
      _.contains(template.templateType.partial, 'bananas').should.be.true;
    });
  });

  describe('when the `isPartial` flag is set on the options:', function () {
    it('should push the name of the type into the `isPartial` array on the cache:', function () {
      var template = new Template();
      template.create('banana', 'bananas', { isPartial: true });

      _.contains(template.templateType.partial, 'partials').should.be.true;
      _.contains(template.templateType.partial, 'bananas').should.be.true;
    });
  });

  describe('when both the `isPartial` and the `isLayout` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      var template = new Template();
      template.create('banana', 'bananas', { isPartial: true, isLayout: true });

      _.contains(template.templateType.partial, 'bananas').should.be.true;
      _.contains(template.templateType.layout, 'bananas').should.be.true;
    });
  });

  describe('when both the `isPartial` and the `isRenderable` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      var template = new Template();
      template.create('banana', 'bananas', { isPartial: true, isRenderable: true });

      _.contains(template.templateType.partial, 'bananas').should.be.true;
      _.contains(template.templateType.renderable, 'bananas').should.be.true;
    });
  });

  describe('when both the `isLayout` and the `isRenderable` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      var template = new Template();
      template.create('banana', 'bananas', { isLayout: true, isRenderable: true });

      _.contains(template.templateType.layout, 'bananas').should.be.true;
      _.contains(template.templateType.renderable, 'bananas').should.be.true;
    });
  });

  describe('when all three types flags are set:', function () {
    it('should push the type into all three arrays:', function () {
      var template = new Template();
      template.create('banana', 'bananas', { isPartial: true, isLayout: true, isRenderable: true });

      _.contains(template.templateType.layout, 'bananas').should.be.true;
      _.contains(template.templateType.partial, 'bananas').should.be.true;
      _.contains(template.templateType.renderable, 'bananas').should.be.true;
    });
  });
});
