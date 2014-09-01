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
      template.page('a', 'b');
      template.cache.pages.should.have.property('a');
    });

    it('should add the template string to the `content` property.', function () {
      var template = new Template();
      template.page('a.md', 'this is content.');
      template.cache.pages['a.md'].content.should.equal('this is content.');
    });

    it('should add original `content` to the `orig.content` property.', function () {
      var template = new Template();
      template.page('a', 'b');
      template.cache.pages.a.content.should.equal('b');
      template.cache.pages.a.orig.should.have.property('content');
    });

    it('should add locals to the `data` property.', function () {
      var template = new Template();
      template.page('a', 'b', {c: 'c'});
      template.cache.pages.a.data.should.have.property('c');
    });

    it('should add locals to the `data` property.', function () {
      var template = new Template();
      template.page('a', 'b', {c: 'c'});
      template.cache.pages.a.data.should.have.property('c');
    });

    it('should add the third arg to the `data` property.', function () {
      var template = new Template();
      template.page('a', 'b', {title: 'c'});
      template.cache.pages.a.data.should.have.property('title');
    });
  });

  describe('.page() objects', function () {
    it('should add a page to the cache.', function () {
      var template = new Template();
      template.page({a: {content: 'b', data: {c: 'c'}}});
      template.cache.pages.should.have.property('a');
    });

    it('should add the template string to the `content` property.', function () {
      var template = new Template();
      template.page({a: {content: 'b', data: {c: 'c'}}});
      template.cache.pages.a.content.should.equal('b');
    });

    it('should add original `content` to the `orig.content` property.', function () {
      var template = new Template();
      template.page({a: {content: 'b', data: {c: 'c'}}});
      template.cache.pages.a.content.should.equal('b');
      template.cache.pages.a.orig.should.have.property('content');
    });

    it('should add locals to the `data` property.', function () {
      var template = new Template();
      template.page({a: {content: 'b', data: {c: 'c'}}});
      template.cache.pages.a.data.should.have.property('c');
    });

    it('should add locals to the `data` property.', function () {
      var template = new Template();
      template.page({a: {content: 'b', data: {c: 'c'}}});
      template.cache.pages.a.data.should.have.property('c');
    });

    it('should add templates with a `path` property.', function () {
      var template = new Template();
      template.page({path: 'foo.hbs', content: '<title>{{author}}</title>', author: 'Brian Woodward'});
      template.cache.pages['foo.hbs'].content.should.equal('<title>{{author}}</title>');
      template.cache.pages['foo.hbs'].data.should.have.property('author');
    });

    it('should add the template string to the `content` property.', function () {
      var template = new Template();
      template.page({'bar.hbs': {content: '<title>{{author}}</title>', author: 'Jon Schlinkert'}});
      template.cache.pages['bar.hbs'].content.should.equal('<title>{{author}}</title>');
      template.cache.pages['bar.hbs'].data.should.have.property('author');
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
      template.page({a: {path: 'a.md', content: '---\nname: AAA\n---\nThis is content.'}});
      template.cache.pages.should.have.property('a');
    });

    it('should merge locals and front-matter data.', function () {
      var template = new Template();
      template.page({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.cache.pages.should.have.property('a.md');
      template.cache.pages['a.md'].data.should.have.property('c');
      template.cache.pages['a.md'].data.name.should.equal('AAA');
    });

    it('should prefer front-matter data over locals.', function () {
      var template = new Template();
      template.page({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {name: 'BBB'}}});
      template.cache.pages.should.have.property('a.md');
      template.cache.pages['a.md'].data.name.should.equal('BBB');
    });

    it('should use the key as `file.path` if one does not exist.', function () {
      var template = new Template();
      template.page({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.cache.pages.should.have.property('a.md');
      template.cache.pages['a.md'].path.should.equal('a.md');
    });
  });
});

