/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var _ = require('lodash');


describe('template page', function () {
  describe('.page() strings', function () {
    it('should add a page to the cache.', function () {
      var template = new Template();
      template.page('a.md', 'b');
      template.cache.pages.should.have.property('a.md');
    });

    it('should `.get()` a page from the cache.', function () {
      var template = new Template();
      template.page('a.md', 'b');
      // must be escaped for [getobject]
      template.get('pages.a\\.md').content.should.equal('b');
    });

    it('should add the template string to the `content` property.', function () {
      var template = new Template();
      template.page('a.md', 'this is content.');
      template.cache.pages['a.md'].content.should.equal('this is content.');
    });

    it('should add original `content` to the `orig.content` property.', function () {
      var template = new Template();
      template.page('a.md', 'b');
      template.cache.pages['a.md'].content.should.equal('b');
      template.cache.pages['a.md'].orig.should.have.property('content');
    });

    it('should add locals to the `data` property.', function () {
      var template = new Template();
      template.page('a.md', 'b', {c: 'c'});
      template.cache.pages['a.md'].data.should.have.property('c');
    });

    it('should add locals to the `data` property.', function () {
      var template = new Template();
      template.page('a.md', 'b', {c: 'c'});
      template.cache.pages['a.md'].data.should.have.property('c');
    });

    it('should add the third arg to the `data` property.', function () {
      var template = new Template();
      template.page('a.md', 'b', {title: 'c'});
      template.cache.pages['a.md'].data.should.eql({title: 'c'});
    });
  });

  describe('.page() objects', function () {
    it('should add a page to the cache.', function () {
      var template = new Template();
      template.page({'a.md': {content: 'b', data: {c: 'c'}}});
      template.cache.pages.should.have.property('a.md');
    });

    it('should add the template string to the `content` property.', function () {
      var template = new Template();
      template.page({'a.md': {content: 'b', data: {c: 'c'}}});
      template.cache.pages['a.md'].content.should.equal('b');
    });

    it('should add original `content` to the `orig.content` property.', function () {
      var template = new Template();
      template.page({'a.md': {content: 'b', data: {c: 'c'}}});
      template.cache.pages['a.md'].content.should.equal('b');
      template.cache.pages['a.md'].orig.should.have.property('content');
    });

    it('should add locals to the `data` property.', function () {
      var template = new Template();
      template.page({'a.md': {content: 'b', data: {c: 'c'}}});
      template.cache.pages['a.md'].data.should.have.property('c');
    });

    it('should add locals to the `data` property.', function () {
      var template = new Template();
      template.page({'a.md': {content: 'b', data: {c: 'c'}}});
      template.cache.pages['a.md'].data.should.have.property('c');
    });
  });

  describe('when a page has front matter', function () {
    it('should parse the page.', function () {
      var template = new Template();
      template.page('a.md', '---\nname: AAA\n---\nThis is content.');
      template.cache.pages.should.have.property('a.md');
      template.cache.pages['a.md'].should.have.property.content;
      template.cache.pages['a.md'].content.should.equal('This is content.');
    });

    it('should parse the `content` value.', function () {
      var template = new Template();
      template.page({'a.md': {path: 'a.md', content: '---\nname: AAA\n---\nThis is content.'}});
      template.cache.pages.should.have.property('a.md');
    });

    it('should merge locals and front-matter data.', function () {
      var template = new Template();
      template.page({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.cache.pages.should.have.property('a.md');
      template.cache.pages['a.md'].data.should.have.property('c');
      template.cache.pages['a.md'].data.name.should.equal('AAA');
    });

    it('should save both locals and front-matter data to the `file` object.', function () {
      var template = new Template();
      template.page({'a.md': {content: '---\nname: AAA\n---\nThis is content.', name: 'BBB'}});
      template.cache.pages.should.have.property('a.md');
      template.cache.pages['a.md'].data.name.should.equal('AAA');
      template.cache.pages['a.md'].locals.name.should.equal('BBB');
    });

    it('should use the key as `file.path` if one does not exist.', function () {
      var template = new Template();
      template.page({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.cache.pages.should.have.property('a.md');
      template.cache.pages['a.md'].path.should.equal('a.md');
    });
  });
});