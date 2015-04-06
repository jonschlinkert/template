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

describe('template layout', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('.layout() strings', function () {
    it('should add a layout to the cache.', function () {
      template.layout('a.md', 'b');
      template.views.layouts.should.have.property('a.md');
    });

    it('should put layouts on the `views.layouts` object.', function () {
      template.layouts('a.md', 'b');
      template.views.layouts['a.md'].should.have.property('content', 'b');
    });

    it('should get layouts with the `.getLayout()` method', function () {
      template.layouts('a.md', 'b');
      template.getLayout('a.md').content.should.equal('b');
    });

    it('should get layouts with the `.view()` collection method', function () {
      template.layouts('a.md', 'b');
      template.view('layouts', 'a.md').content.should.equal('b');
    });

    it('should add the template string to the `content` property.', function () {
      template.layouts('a.md', 'this is content.');
      template.views.layouts['a.md'].content.should.equal('this is content.');
    });

    it('should add the template string to the `content` property.', function () {
      template.layout('a.md', 'this is content.');
      template.views.layouts['a.md'].content.should.equal('this is content.');
    });

    it('should add add the string to a `content` property.', function () {
      template.layout('a.md', 'b');
      template.views.layouts['a.md'].should.have.property('content', 'b');
    });

    it('should add locals to the `locals` property.', function () {
      template.layout('a.md', 'b', {c: 'c'});
      template.views.layouts['a.md'].locals.should.have.property('c');
    });

    it('should add locals to the `locals` property.', function () {
      template.layout('a.md', 'b', {c: 'c'});
      template.views.layouts['a.md'].locals.should.have.property('c');
    });

    it('should add the third arg to the `locals` property.', function () {
      template.layout('a.md', 'b', {title: 'c'});
      template.views.layouts['a.md'].locals.should.have.property('title');
    });
  });

  describe('.layout() objects', function () {
    it('should add a layout to the cache.', function () {
      template.layout({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.layouts.should.have.property('a.md');
    });

    it('should add the template string to the `content` property.', function () {
      template.layout({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.layouts['a.md'].content.should.equal('b');
    });

    it('should add locals to the `data` property.', function () {
      template.layout({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.layouts['a.md'].should.have.property('data', {c: 'c'});
      template.views.layouts['a.md'].should.have.property('content', 'b');
    });

    it('should add locals to the `data` property.', function () {
      template.layout({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.layouts['a.md'].data.should.have.property('c');
    });
  });

  describe('when a layout has front matter', function () {
    it('should parse the layout.', function () {
      template.layout('a.md', '---\nname: AAA\n---\nThis is content.');
      template.views.layouts['a.md'].should.have.property.content;
      template.views.layouts['a.md'].content.should.equal('This is content.');
    });

    it('should parse the `content` value.', function () {
      template.layout({'a.md': {path: 'a.md', content: '---\nname: AAA\n---\nThis is content.'}});
      template.views.layouts.should.have.property('a.md');
    });

    it('should keep locals and front-matter data separate.', function () {
      template.layout({'a.md': {content: '---\nname: AAA\n---\nThis is content.', locals: {c: 'c'}}});
      template.views.layouts['a.md'].should.have.property('data', { name: 'AAA' });
      template.views.layouts['a.md'].should.have.property('locals', { c: 'c' });
    });

    it('should save both locals and front-matter data to the `file` object.', function () {
      template.layout({'a.md': {content: '---\nname: AAA\n---\nThis is content.', locals: {name: 'BBB'}}});
      template.views.layouts['a.md'].data.name.should.equal('AAA');
      template.views.layouts['a.md'].locals.name.should.equal('BBB');
    });

    it('should use the key as `file.path` if one does not exist.', function () {
      template.layout({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.views.layouts['a.md'].path.should.equal('a.md');
    });
  });
});
