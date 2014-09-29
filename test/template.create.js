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

      _.contains(template.templateType.isRenderable, 'pages').should.be.true;
      _.contains(template.templateType.isRenderable, 'apples').should.be.true;
    });
  });

  describe('when the `layout` flag is set on the options:', function () {
    it('should push the name of the type into the `layout` array on the cache:', function () {
      var template = new Template();
      template.create('orange', 'oranges', { isLayout: true });

      _.contains(template.templateType.layout, 'layouts').should.be.true;
      _.contains(template.templateType.layout, 'oranges').should.be.true;
    });
  });

  describe('when neither the `layout` flag, nor the `isRenderable` is set on the options:', function () {
    it('should push the name of the type into the `partial` array on the cache:', function () {
      var template = new Template();
      template.create('banana', 'bananas');

      _.contains(template.templateType.partial, 'partials').should.be.true;
      _.contains(template.templateType.partial, 'bananas').should.be.true;
    });
  });


  describe('when the `partial` flag is set on the options:', function () {
    it('should push the name of the type into the `partial` array on the cache:', function () {
      var template = new Template();
      template.create('banana', 'bananas', { isPartial: true });

      _.contains(template.templateType.partial, 'partials').should.be.true;
      _.contains(template.templateType.partial, 'bananas').should.be.true;
    });
  });
});
