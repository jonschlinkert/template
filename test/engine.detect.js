/*!
 * template <https://github.com/jonschlinkert/template>
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


describe('detect engine', function() {
  describe('detect from `engine` property', function() {
    it('should detect the template engine from the options.', function() {
      var template = new Template();
      template.page('a', {content: 'This is content.', options: {engine: '.foo'}});
      template.cache.pages['a'].options.should.have.property('engine', '.foo');
    });

    it('should detect the template engine from the locals.', function() {
      var template = new Template();
      template.page('a', {content: 'This is content.', a: 'b', engine: '.foo'});
      template.cache.pages['a'].locals.should.have.property('engine', '.foo');
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

      template.cache.includes['a'].options.should.have.property('engine', '.faz');
      template.cache.docs['b'].options.should.have.property('engine', '.fez');
    });
  });

  describe('detect from file extension', function() {
    it('should detect the file extension from the template options.', function() {
      var template = new Template();
      template.page('a.md', 'b');
      template.cache.pages['a.md'].should.have.property('ext', '.md');
    });

    it('should detect the file extension from the path property.', function() {
      var template = new Template();
      template.page('a', {path: 'a.md', content: 'This is content.'});
      template.cache.pages['a'].should.have.property('ext', '.md');
    });

    it('should detect the file extension from the options.', function() {
      var template = new Template();
      template.page('a', {content: 'This is content.', options: {ext: '.foo'}});
      template.cache.pages['a'].should.have.property('ext', '.foo');
    });

    it('should detect the file extension from the options.', function() {
      var template = new Template();
      template.page('a', {content: 'This is content.'}, {a: 'b'}, {ext: '.foo'});
      template.cache.pages['a'].should.have.property('ext', '.foo');
    });

    it('should detect the file extension from the locals.', function() {
      var template = new Template();
      template.page('a', {content: 'This is content.'}, {ext: '.foo'});
      template.cache.pages['a'].should.have.property('ext', '.foo');
    });
  });
});

