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


describe('.getViewType()', function() {
  beforeEach(function() {
    template = new Template();
  });

  it('should get all built-in templates of `type: renderable`:', function () {
    template.page('abc.md', '<%= abc %>');
    template.getViewType('renderable').should.be.an.object;
    template.getViewType('renderable').should.have.property('pages');
    template.getViewType('renderable').pages.should.have.property('abc.md');
  });

  it('should get all custom templates of `type: renderable`:', function () {
    template.create('post', { viewType: 'renderable'});
    template.post('xyz.md', '<%= abc %>');
    template.getViewType('renderable').should.be.an.object;
    template.getViewType('renderable').should.have.property('posts');
    template.getViewType('renderable').posts.should.have.property('xyz.md');
  });

  it('should get all templates of built-in `type: partial`:', function () {
    template.create('include', { viewType: 'partial' });
    template.partial('abc.md', '<%= abc %>');
    template.include('xyz.md', '<%= abc %>');

    template.getViewType('partial').should.be.an.object;
    template.getViewType('partial').should.have.property('partials');
    template.getViewType('partial').should.have.property('includes');
    template.getViewType('partial').partials.should.have.property('abc.md');
    template.getViewType('partial').includes.should.have.property('xyz.md');
  });

  it('should get all templates of custom `type: partial`:', function () {
    template.create('include', { viewType: 'partial' });
    template.include('xyz.md', '<%= abc %>');

    template.getViewType('partial').should.be.an.object;
    template.getViewType('partial').should.have.property('includes');
    template.getViewType('partial').includes.should.have.property('xyz.md');
  });

  it('should get all templates of `type: layout`:', function () {
    template.create('block', { viewType: 'layout' });
    template.layout('abc.md', '<%= abc %>');
    template.block('xyz.md', '<%= abc %>');

    template.getViewType('layout').should.be.an.object;
    template.getViewType('layout').should.have.property('layouts');
    template.getViewType('layout').should.have.property('blocks');
    template.getViewType('layout').layouts.should.have.property('abc.md');
    template.getViewType('layout').blocks.should.have.property('xyz.md');
  });
});
