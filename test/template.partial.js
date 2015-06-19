/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var path = require('path');
var assert = require('assert');
var Template = require('./app');
var template;

describe('template partial', function () {
  beforeEach(function () {
    template = new Template();
    template.engine('md', require('engine-lodash'));
    template.enable('frontMatter');
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

    it('should get partials with the `.partials.get()` method', function () {
      template.partial('a.md', 'b');
      template.partials.get('a.md').content.should.equal('b');
    });

    it('should get partials with the `.getView()` collection method', function () {
      template.partial('a.md', 'b');
      template.getView('partials', 'a.md').content.should.equal('b');
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
      template.views.partials['a.md'].should.have.property('locals');
      template.views.partials['a.md'].locals.should.have.property('c', 'c');
    });

    it('should save both locals and front-matter data to the `file` object.', function () {
      template.partial({'a.md': {content: '---\nname: AAA\n---\nThis is content.', locals: {name: 'BBB'}}});
      template.views.partials['a.md'].data.name.should.equal('AAA');
      template.views.partials['a.md'].locals.name.should.equal('BBB');
    });

    it('should use the key as `file.path` if one does not exist.', function () {
      template.partial({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.views.partials['a.md'].path.should.equal('a.md');
    });
  });

  describe('renameKey', function () {
    it('should use the renameKey function on options', function () {
      template.option('renameKey', function (fp) {
        return path.basename(fp, path.extname(fp));
      });
      template.partial('a.md', '---\nname: AAA\n---\nThis is content.');
      template.views.partials.should.have.property.a;
      template.views.partials['a'].should.have.property.content;
      template.views.partials['a'].content.should.equal('This is content.');
    });
  });
});
