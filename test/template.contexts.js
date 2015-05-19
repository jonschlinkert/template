/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('./app');
var template;

describe('template contexts', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('global contexts', function () {
    it('should store a global context for a subtype', function () {
      template.create('box', {layout: 'foo'});
      template.layout('a', '...');
      template.contexts.should.have.property('boxes');
      template.contexts.boxes.should.have.property('layout', 'foo');
    });
  });

  describe('template contexts', function () {
    it('templates should have a context property', function () {
      template.create('box', {layout: 'foo'});
      template.box('a', '...');
      template.views.boxes.a.should.have.property('contexts');
    });

    it('should store a `.create` context', function () {
      template.create('box', {layout: 'foo'});
      template.box('a', '...');
      template.views.boxes.a.contexts.should.have.property('create');
      template.views.boxes.a.contexts.create.should.have.property('layout', 'foo');
    });

    it('should store a `.load` context:', function () {
      template.create('box', {layout: 'foo'});
      template.box('a', '...', {layout: 'bar'});
      template.views.boxes.a.contexts.should.have.property('load');
      template.views.boxes.a.contexts.load.should.have.property('layout', 'bar');
    });
  });
});
