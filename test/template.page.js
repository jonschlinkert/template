/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('./app');
var template;


describe('template page', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('.page() strings', function () {
    it('should add a page to the cache.', function () {
      template.page('a.md', 'b');
      template.views.pages.should.have.property('a.md');
    });

    it('should put pages on the `views.pages` object.', function () {
      template.pages('a.md', 'b');
      template.views.pages['a.md'].should.have.property('content', 'b');
    });

    it('should get pages with the `.getPage()` method', function () {
      template.pages('a.md', 'b');
      template.getPage('a.md').content.should.equal('b');
    });

    it('should get pages with the `.view()` collection method', function () {
      template.pages('a.md', 'b');
      template.view('pages', 'a.md').content.should.equal('b');
    });

    it('should add the template string to the `content` property.', function () {
      template.pages('a.md', 'this is content.');
      template.views.pages['a.md'].content.should.equal('this is content.');
    });

    it('should add the template string to the `content` property.', function () {
      template.page('a.md', 'this is content.');
      template.views.pages['a.md'].content.should.equal('this is content.');
    });

    it('should add add the string to a `content` property.', function () {
      template.page('a.md', 'b');
      template.views.pages['a.md'].should.have.property('content', 'b');
    });

    it('should add locals to the `locals` property.', function () {
      template.page('a.md', 'b', {c: 'c'});
      template.views.pages['a.md'].locals.should.have.property('c');
    });

    it('should add locals to the `locals` property.', function () {
      template.page('a.md', 'b', {c: 'c'});
      template.views.pages['a.md'].locals.should.have.property('c');
    });

    it('should add the third arg to the `locals` property.', function () {
      template.page('a.md', 'b', {title: 'c'});
      template.views.pages['a.md'].locals.should.have.property('title');
    });
  });

  describe('.page() objects', function () {
    it('should add a page to the cache.', function () {
      template.page({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.pages.should.have.property('a.md');
    });

    it('should add the template string to the `content` property.', function () {
      template.page({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.pages['a.md'].content.should.equal('b');
    });

    it('should add locals to the `data` property.', function () {
      template.page({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.pages['a.md'].should.have.property('data', {c: 'c'});
      template.views.pages['a.md'].should.have.property('content', 'b');
    });

    it('should add locals to the `data` property.', function () {
      template.page({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.pages['a.md'].data.should.have.property('c');
    });
  });

  describe('when a page has front matter', function () {
    it('should parse the page.', function () {
      template.page('a.md', '---\nname: AAA\n---\nThis is content.');
      template.views.pages['a.md'].should.have.property.content;
      template.views.pages['a.md'].content.should.equal('This is content.');
    });

    it('should parse the `content` value.', function () {
      template.page({'a.md': {path: 'a.md', content: '---\nname: AAA\n---\nThis is content.'}});
      template.views.pages.should.have.property('a.md');
    });

    it('should keep locals and front-matter data separate.', function () {
      template.page({'a.md': {content: '---\nname: AAA\n---\nThis is content.', locals: {c: 'c'}}});
      template.views.pages['a.md'].should.have.property('data', { name: 'AAA' });
      template.views.pages['a.md'].should.have.property('locals', { c: 'c' });
    });

    it('should save both locals and front-matter data to the `file` object.', function () {
      template.page({'a.md': {content: '---\nname: AAA\n---\nThis is content.', locals: {name: 'BBB'}}});
      template.views.pages['a.md'].data.name.should.equal('AAA');
      template.views.pages['a.md'].locals.name.should.equal('BBB');
    });

    it('should use the key as `file.path` if one does not exist.', function () {
      template.page({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.views.pages['a.md'].path.should.equal('a.md');
    });
  });
});
