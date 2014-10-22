/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Engine = require('..');
var template;

describe('engine create:', function () {
  beforeEach(function () {
    template = new Engine();
  });

  describe('.create():', function () {
    it('should create a new template `type`:', function () {
      template.create('include', 'includes');

      template.should.have.property('include');
      template.should.have.property('includes');
    });
  });

  describe('when a new template type is created:', function () {
    it('should add templates registered for that type to its corresponding (plural) object:', function () {
      template.create('apple', 'apples');

      template.apple('a', 'one');
      template.apple('b', 'two');
      template.apple('c', 'three');

      template.cache.should.have.property('apples');
      template.cache.apples.should.have.properties('a', 'b', 'c');
    });
  });

  describe('when the `isRenderable` flag is set on the options:', function () {
    it('should push the name of the type into the `isRenderable` array:', function () {
      template.create('apple', 'apples', { isRenderable: true });

      template.templateType.renderable.should.containEql('pages');
      template.templateType.renderable.should.containEql('apples');
      template.templateType.renderable.should.containEql('apples');
    });
  });

  describe('when the `isLayout` flag is set on the options:', function () {
    it('should push the name of the type into the `isLayout` array:', function () {
      template.create('orange', 'oranges', { isLayout: true });

      template.templateType.layout.should.containEql('layouts');
      template.templateType.layout.should.containEql('oranges');
    });
  });

  describe('when no type flag is set on the options:', function () {
    it('should push the name of the type into the `isPartial` array:', function () {
      template.create('banana', 'bananas');

      template.templateType.partial.should.containEql('partials');
      template.templateType.partial.should.containEql('bananas');
    });
  });

  describe('when the `isPartial` flag is set on the options:', function () {
    it('should push the name of the type into the `isPartial` array:', function () {
      template.create('banana', 'bananas', { isPartial: true });

      template.templateType.partial.should.containEql('partials');
      template.templateType.partial.should.containEql('bananas');
    });
  });

  describe('when both the `isPartial` and the `isLayout` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      template.create('banana', 'bananas', { isPartial: true, isLayout: true });

      template.templateType.partial.should.containEql('bananas');
      template.templateType.layout.should.containEql('bananas');
    });
  });

  describe('when both the `isPartial` and the `isRenderable` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      template.create('banana', 'bananas', { isPartial: true, isRenderable: true });

      template.templateType.partial.should.containEql('bananas');
      template.templateType.renderable.should.containEql('bananas');
    });
  });

  describe('when both the `isLayout` and the `isRenderable` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      template.create('banana', 'bananas', { isLayout: true, isRenderable: true });

      template.templateType.layout.should.containEql('bananas');
      template.templateType.renderable.should.containEql('bananas');
    });
  });

  describe('when all three types flags are set:', function () {
    it('should push the type into all three arrays:', function () {
      template.create('banana', 'bananas', { isPartial: true, isLayout: true, isRenderable: true });

      template.templateType.layout.should.containEql('bananas');
      template.templateType.partial.should.containEql('bananas');
      template.templateType.renderable.should.containEql('bananas');
    });
  });
});
