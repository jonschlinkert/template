/*!
 * engine-engines <https://github.com/jonschlinkert/engine-engines>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var should = require('should');
var Template = require('..');
var template = new Template();


describe('engine', function() {
  it('should detect the template engine from the options.', function() {
    var template = new Template();
    template.page('a', {content: 'This is content.', options: {engine: '.foo'}});
    template.cache.pages.should.have.property('a');
    template.cache.pages['a'].options.should.have.property('engine', '.foo');
  });

  it('should detect the template engine from the options.', function() {
    var template = new Template();
    template.page('a', {content: 'This is content.'}, {a: 'b'}, {engine: '.foo'});
    template.cache.pages.should.have.property('a');
    template.cache.pages['a'].options.should.have.property('engine', '.foo');
  });

  it('should detect the template engine from the locals.', function() {
    var template = new Template();
    template.page('a', {content: 'This is content.'}, {engine: '.foo'});
    template.cache.pages.should.have.property('a');
    template.cache.pages['a'].options.should.have.property('engine', '.foo');
  });

  it('should detect the template engine from `.create()`.', function() {
    var template = new Template();

    template.create('include', 'includes', {
      engine: '.faz'
    });

    template.create('doc', 'docs', {
      engine: '.fez'
    });

    template.include('a', {content: 'This is content.'});
    template.doc('b', {content: 'This is more content.'});

    template.cache.includes.should.have.property('a');
    template.cache.includes['a'].options.should.have.property('engine', '.faz');

    template.cache.docs.should.have.property('b');
    template.cache.docs['b'].options.should.have.property('engine', '.fez');
  });
});

