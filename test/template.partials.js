/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('../tmpl');
var _ = require('lodash');


describe('template partial', function () {
  describe('.partial() strings', function () {
    it('should add partials to the cache.', function () {
      var template = new Template();
      template.partials('a.md', 'b');
      template.cache.partials.should.have.property('a.md');
    });

    it('should `.get()` partials from the cache.', function () {
      var template = new Template();
      template.partials('a.md', 'b');
      // must be escaped for [getobject]
      template.get('partials.a\\.md').content.should.equal('b');
    });

    it('should add the template string to the `content` property.', function () {
      var template = new Template();
      template.partials('a.md', 'this is content.');
      template.cache.partials['a.md'].content.should.equal('this is content.');
    });

    it('should add locals to the `locals` property.', function () {
      var template = new Template();
      template.partials('a.md', 'b', {c: 'c'});
      template.cache.partials['a.md'].locals.should.have.property('c');
    });

    it('should add locals to the `locals` property.', function () {
      var template = new Template();
      template.partials('a.md', 'b', {c: 'c'});
      template.cache.partials['a.md'].locals.should.have.property('c');
    });

    it('should add the third arg to the `locals` property.', function () {
      var template = new Template();
      template.partials('a.md', 'b', {title: 'c'});
      template.cache.partials['a.md'].locals.should.have.property('title');
    });
  });

  describe('.partials() objects', function () {
    it('should add partials to the cache.', function () {
      var template = new Template();
      template.partials({'a.md': {content: 'b', data: {c: 'c'}}});
      template.cache.partials.should.have.property('a.md');
    });

    it('should add the template string to the `content` property.', function () {
      var template = new Template();
      template.partials({'a.md': {content: 'b', data: {c: 'c'}}});
      template.cache.partials['a.md'].content.should.equal('b');
    });

    it('should add locals to the `data` property.', function () {
      var template = new Template();
      template.partials({'a.md': {content: 'b', data: {c: 'c'}}});
      template.cache.partials['a.md'].data.should.have.property('c');
    });

    it('should add locals to the `data` property.', function () {
      var template = new Template();
      template.partials({'a.md': {content: 'b', data: {c: 'c'}}});
      template.cache.partials['a.md'].data.should.have.property('c');
    });
  });

  describe('when partials has front matter', function () {
    it('should parse the partial.', function () {
      var template = new Template();
      template.partials('a.md', '---\nname: AAA\n---\nThis is content.');
      template.cache.partials.should.have.property('a.md');
      template.cache.partials['a.md'].should.have.property('content', 'This is content.');
    });

    it('should parse the `content` value.', function () {
      var template = new Template();
      template.partials({'a.md': {path: 'a.md', content: '---\nname: AAA\n---\nThis is content.'}});
      template.cache.partials.should.have.property('a.md');
    });

    it('should merge locals and front-matter data.', function () {
      var template = new Template();
      template.partials({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.cache.partials.should.have.property('a.md');
      template.cache.partials['a.md'].should.have.property('data', { c: 'c', name: 'AAA' });
    });

    it('should save both locals and front-matter data to the `file` object.', function () {
      var template = new Template();
      template.partials({'a.md': {content: '---\nname: AAA\n---\nThis is content.', name: 'BBB'}});
      template.cache.partials.should.have.property('a.md');
      template.cache.partials['a.md'].should.have.property('data', { name: 'AAA' });
      template.cache.partials['a.md'].should.have.property('locals', { name: 'BBB' });
    });

    it('should use the key as `file.path` if one does not exist.', function () {
      var template = new Template();
      template.partials({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.cache.partials.should.have.property('a.md');
      template.cache.partials['a.md'].path.should.equal('a.md');
    });
  });
});