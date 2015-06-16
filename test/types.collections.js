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

describe('template collections', function() {
  beforeEach(function() {
    template = new Template();
  });

  it.only('should have templates of built-in collection `pages`:', function () {
    template.page('abc.md', '<%= abc %>');
    template.views.pages.should.be.an.object;
    console.log(template.views.pages)
    // template.views.pages.should.have.property('abc.md');
  });

  it('should have templates of custom collection `posts`:', function () {
    template.create('post', { viewType: 'renderable' });
    template.post('xyz.md', '<%= abc %>');
    template.views.posts.should.be.an.object;
    template.views.posts.should.have.property('xyz.md');
  });

  it('should have templates of built-in collection `partials`:', function () {
    template.partial('abc.md', '<%= abc %>');
    template.views.partials.should.be.an.object;
    template.views.partials.should.have.property('abc.md');
  });

  it('should have templates of custom collection `includes`:', function () {
    template.create('include', { viewType: 'partial' });
    template.include('xyz.md', '<%= abc %>');

    template.views.includes.should.be.an.object;
    template.views.includes.should.have.property('xyz.md');
  });

  it('should have templates of built-in collection `layouts`:', function () {
    template.layout('abc.md', '<%= abc %>');
    template.views.layouts.should.be.an.object;
    template.views.layouts.should.have.property('abc.md');
  });

  it('should have templates of custom collection `blocks`:', function () {
    template.create('block', { viewType: 'layout' });
    template.block('xyz.md', '<%= abc %>');

    template.views.blocks.should.be.an.object;
    template.views.blocks.should.have.property('xyz.md');
  });
});
