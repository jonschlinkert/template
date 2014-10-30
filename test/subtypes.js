/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;


describe('subtypes', function() {
  beforeEach(function() {
    template = new Template();
  });

  it('should have templates of built-in `subtype: pages`:', function () {
    template.page('abc.md', '<%= abc %>');
    template.cache.pages.should.be.an.object;
    template.cache.pages.should.have.property('abc.md');
  });

  it('should have templates of custom `subtype: posts`:', function () {
    template.create('post', { isRenderable: true });
    template.post('xyz.md', '<%= abc %>');
    template.cache.posts.should.be.an.object;
    template.cache.posts.should.have.property('xyz.md');
  });

  it('should have templates of built-in `subtype: partials`:', function () {
    template.partial('abc.md', '<%= abc %>');
    template.cache.partials.should.be.an.object;
    template.cache.partials.should.have.property('abc.md');
  });

  it('should have templates of custom `subtype: includes`:', function () {
    template.create('include', { isPartial: true });
    template.include('xyz.md', '<%= abc %>');

    template.cache.includes.should.be.an.object;
    template.cache.includes.should.have.property('xyz.md');
  });

  it('should have templates of built-in `subtype: layouts`:', function () {
    template.layout('abc.md', '<%= abc %>');
    template.cache.layouts.should.be.an.object;
    template.cache.layouts.should.have.property('abc.md');
  });

  it('should have templates of custom `subtype: blocks`:', function () {
    template.create('block', { isLayout: true });
    template.block('xyz.md', '<%= abc %>');

    template.cache.blocks.should.be.an.object;
    template.cache.blocks.should.have.property('xyz.md');
  });
});
