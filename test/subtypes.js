/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Engine = require('..');
var engine;


describe('subtypes', function() {
  beforeEach(function() {
    engine = new Engine();
  });

  it('should have templates of built-in `subtype: pages`:', function () {
    engine.page('abc.md', '<%= abc %>');
    engine.cache.pages.should.be.an.object;
    engine.cache.pages.should.have.property('abc.md');
  });

  it('should have templates of custom `subtype: posts`:', function () {
    engine.create('post', { isRenderable: true });
    engine.post('xyz.md', '<%= abc %>');
    engine.cache.posts.should.be.an.object;
    engine.cache.posts.should.have.property('xyz.md');
  });

  it('should have templates of built-in `subtype: partials`:', function () {
    engine.partial('abc.md', '<%= abc %>');
    engine.cache.partials.should.be.an.object;
    engine.cache.partials.should.have.property('abc.md');
  });

  it('should have templates of custom `subtype: includes`:', function () {
    engine.create('include', { isPartial: true });
    engine.include('xyz.md', '<%= abc %>');

    engine.cache.includes.should.be.an.object;
    engine.cache.includes.should.have.property('xyz.md');
  });

  it('should have templates of built-in `subtype: layouts`:', function () {
    engine.layout('abc.md', '<%= abc %>');
    engine.cache.layouts.should.be.an.object;
    engine.cache.layouts.should.have.property('abc.md');
  });

  it('should have templates of custom `subtype: blocks`:', function () {
    engine.create('block', { isLayout: true });
    engine.block('xyz.md', '<%= abc %>');

    engine.cache.blocks.should.be.an.object;
    engine.cache.blocks.should.have.property('xyz.md');
  });
});
