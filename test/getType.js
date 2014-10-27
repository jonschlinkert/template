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


describe('.getType()', function() {
  beforeEach(function() {
    engine = new Engine();
  });

  it('should get all templates of `type: renderable`:', function () {
    engine.create('post', { isRenderable: true });
    engine.page('abc.md', '<%= abc %>');
    engine.post('xyz.md', '<%= abc %>');

    engine.getType('renderable').should.be.an.object;
    engine.getType('renderable').should.have.property('pages');
    engine.getType('renderable').should.have.property('posts');
    engine.getType('renderable').pages.should.have.property('abc.md');
    engine.getType('renderable').posts.should.have.property('xyz.md');
  });

  it('should get all templates of `type: partial`:', function () {
    engine.create('include', { isPartial: true });
    engine.partial('abc.md', '<%= abc %>');
    engine.include('xyz.md', '<%= abc %>');

    engine.getType('partial').should.be.an.object;
    engine.getType('partial').should.have.property('partials');
    engine.getType('partial').should.have.property('includes');
    engine.getType('partial').partials.should.have.property('abc.md');
    engine.getType('partial').includes.should.have.property('xyz.md');
  });

  it('should get all templates of `type: layout`:', function () {
    engine.create('block', { isLayout: true });
    engine.layout('abc.md', '<%= abc %>');
    engine.block('xyz.md', '<%= abc %>');

    engine.getType('layout').should.be.an.object;
    engine.getType('layout').should.have.property('layouts');
    engine.getType('layout').should.have.property('blocks');
    engine.getType('layout').layouts.should.have.property('abc.md');
    engine.getType('layout').blocks.should.have.property('xyz.md');
  });
});
