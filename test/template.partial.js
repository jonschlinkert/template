/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var template;

describe('template partial', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('.partial() strings', function () {
    it('should add a partial to the cache.', function () {
      template.partial('a.md', 'b');
      template.views.partials.should.have.property('a.md');
    });

    it('should put partials on the `views.partials` object.', function () {
      template.partial('a.md', 'b');
      template.views.partials['a.md'].should.have.property('content', 'b');
    });

    it('should get partials with the `.getPartial()` method', function () {
      template.partial('a.md', 'b');
      template.getPartial('a.md').content.should.equal('b');
    });

    it('should get partials with the `.view()` collection method', function () {
      template.partial('a.md', 'b');
      template.view('partials', 'a.md').content.should.equal('b');
    });

    it('should add the template string to the `content` property.', function () {
      template.partial('a.md', 'this is content.');
      template.views.partials['a.md'].content.should.equal('this is content.');
    });
    it('should add the template string to the `content` property.', function () {
      template.partial('a.md', 'this is content.');
      template.views.partials['a.md'].content.should.equal('this is content.');
    });

    it('should add add the string to a `content` property.', function () {
      template.partial('a.md', 'b');
      template.views.partials['a.md'].should.have.property('content', 'b');
    });

    it('should add locals to the `locals` property.', function () {
      template.partial('a.md', 'b', {c: 'c'});
      template.views.partials['a.md'].locals.should.have.property('c');
    });

    it('should add locals to the `locals` property.', function () {
      template.partial('a.md', 'b', {c: 'c'});
      template.views.partials['a.md'].locals.should.have.property('c');
    });

    it('should add the third arg to the `locals` property.', function () {
      template.partial('a.md', 'b', {title: 'c'});
      template.views.partials['a.md'].locals.should.have.property('title');
    });
  });

  describe('.partial() objects', function () {
    it('should add a partial to the cache.', function () {
      template.partial({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.partials.should.have.property('a.md');
    });

    it('should add the template string to the `content` property.', function () {
      template.partial({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.partials['a.md'].content.should.equal('b');
    });

    it('should add locals to the `data` property.', function () {
      template.partial({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.partials['a.md'].should.have.property('data', {c: 'c'});
      template.views.partials['a.md'].should.have.property('content', 'b');
    });

    it('should add locals to the `data` property.', function () {
      template.partial({'a.md': {content: 'b', data: {c: 'c'}}});
      template.views.partials['a.md'].data.should.have.property('c');
    });
  });

  describe('when a partial has front matter', function () {
    it('should parse the partial.', function () {
      template.partial('a.md', '---\nname: AAA\n---\nThis is content.');
      template.views.partials['a.md'].should.have.property.content;
      template.views.partials['a.md'].content.should.equal('This is content.');
    });

    it('should parse the `content` value.', function () {
      template.partial({'a.md': {path: 'a.md', content: '---\nname: AAA\n---\nThis is content.'}});
      template.views.partials.should.have.property('a.md');
    });

    it('should keep locals and front-matter data separate.', function () {
      template.partial({'a.md': {content: '---\nname: AAA\n---\nThis is content.', locals: {c: 'c'}}});
      template.views.partials['a.md'].should.have.property('data', { name: 'AAA' });
      template.views.partials['a.md'].should.have.property('locals', { c: 'c' });
    });

    it('should save both locals and front-matter data to the `file` object.', function () {
      template.partial({'a.md': {content: '---\nname: AAA\n---\nThis is content.', name: 'BBB'}});
      template.views.partials['a.md'].data.name.should.equal('AAA');
      template.views.partials['a.md'].locals.name.should.equal('BBB');
    });

    it('should use the key as `file.path` if one does not exist.', function () {
      template.partial({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.views.partials['a.md'].path.should.equal('a.md');
    });
  });

  describe('partialsKey', function () {
    it('should use the partialsKey function on options', function () {
      // TODO: should this be removed?
      template.options.partialsKey('a.md').should.eql('a');
      // template.partial('a.md', '---\nname: AAA\n---\nThis is content.');
      // template.views.partials.should.have.property.a;
      // template.views.partials['a'].should.have.property.content;
      // template.views.partials['a'].content.should.equal('This is content.');
    });
  });
});