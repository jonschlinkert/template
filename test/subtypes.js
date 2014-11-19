/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;


describe('template subtypes', function() {
  beforeEach(function() {
    template = new Template();
  });

  it('should have templates of built-in `subtype: pages`:', function () {
    template.page('abc.md', '<%= abc %>');
    template.views.pages.should.be.an.object;
    template.views.pages.should.have.property('abc.md');
  });

  it('should have templates of custom `subtype: posts`:', function () {
    template.create('post', { isRenderable: true });
    template.post('xyz.md', '<%= abc %>');
    template.views.posts.should.be.an.object;
    template.views.posts.should.have.property('xyz.md');
  });

  it('should have templates of built-in `subtype: partials`:', function () {
    template.partial('abc.md', '<%= abc %>');
    template.views.partials.should.be.an.object;
    template.views.partials.should.have.property('abc.md');
  });

  it('should have templates of custom `subtype: includes`:', function () {
    template.create('include', { isPartial: true });
    template.include('xyz.md', '<%= abc %>');

    template.views.includes.should.be.an.object;
    template.views.includes.should.have.property('xyz.md');
  });

  it('should have templates of built-in `subtype: layouts`:', function () {
    template.layout('abc.md', '<%= abc %>');
    template.views.layouts.should.be.an.object;
    template.views.layouts.should.have.property('abc.md');
  });

  it('should have templates of custom `subtype: blocks`:', function () {
    template.create('block', { isLayout: true });
    template.block('xyz.md', '<%= abc %>');

    template.views.blocks.should.be.an.object;
    template.views.blocks.should.have.property('xyz.md');
  });
});
