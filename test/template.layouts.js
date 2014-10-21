/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var path = require('path');
var assert = require('assert');
var should = require('should');
var Template = require('..');


describe('template layout', function () {
  describe('.layouts()', function () {
    it('should add layouts defined as strings.', function () {
      var template = new Template();
      template.layout('x.md', 'this is a layout');
      template.layout('y.md', 'this is a layout');
      template.layout('z.md', 'this is a layout');
      template.cache.layouts.should.have.property('x.md');
      template.cache.layouts.should.have.property('y.md');
      template.cache.layouts.should.have.property('z.md');
    });

    it('should add layouts defined as glob patterns.', function () {
      var template = new Template();
      template.layouts(['test/fixtures/layouts/matter/*.md']);
      template.cache.layouts.should.have.property('a.md');
    });

    it('should use a custom rename function on layout keys:', function () {
      var template = new Template();
      template.option('renameKey', function (filepath) {
        return path.basename(filepath, path.extname(filepath));
      });

      template.layouts(['test/fixtures/layouts/matter/*.md']);
      template.cache.layouts.should.have.property('a');
      template.cache.layouts.should.have.property('b');
      template.cache.layouts.should.have.property('c');
    });

    it('should use a custom rename function on layout keys:', function () {
      var template = new Template();
      template.option('renameKey', function (filepath) {
        return path.basename(filepath);
      });

      template.layouts(['test/fixtures/layouts/matter/*.md']);
      template.cache.layouts.should.have.property('a.md');
      template.cache.layouts.should.have.property('b.md');
      template.cache.layouts.should.have.property('c.md');
    });

    it('should use a custom rename function on layout keys:', function () {
      var template = new Template();
      template.option('renameKey', function (filepath) {
        return path.basename(filepath) + ':string';
      });

      template.layouts(['test/fixtures/layouts/matter/*.md']);
      template.cache.layouts.should.have.property('a.md:string');
      template.cache.layouts.should.have.property('b.md:string');
      template.cache.layouts.should.have.property('c.md:string');
    });
  });

  describe('when a layout has front matter', function () {
    it('should parse the layout.', function () {
      var template = new Template();
      template.layouts('a.md', '---\nname: AAA\n---\nThis is content.');
      template.cache.layouts.should.have.property('a.md');
      template.cache.layouts['a.md'].should.have.property.content;
      template.cache.layouts['a.md'].content.should.equal('This is content.');
    });

    it('should parse the `content` value.', function () {
      var template = new Template();
      template.layouts({'a.md': {path: 'a.md', content: '---\nname: AAA\n---\nThis is content.'}});
      template.cache.layouts.should.have.property('a.md');
    });

    it('should merge `data` with front-matter data.', function () {
      var template = new Template();
      template.layouts({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.cache.layouts.should.have.property('a.md');
      template.cache.layouts['a.md'].data.should.have.property('c');
      template.cache.layouts['a.md'].data.name.should.equal('AAA');
    });

    it('should save both locals and front-matter data to the `file` object.', function () {
      var template = new Template();
      template.layouts({'a.md': {content: '---\nname: AAA\n---\nThis is content.', name: 'BBB'}});
      template.cache.layouts.should.have.property('a.md');
      template.cache.layouts['a.md'].data.name.should.equal('AAA');
      template.cache.layouts['a.md'].locals.name.should.equal('BBB');
    });

    it('should use the key as `file.path` if one does not exist.', function () {
      var template = new Template();
      template.layouts({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.cache.layouts.should.have.property('a.md');
      template.cache.layouts['a.md'].path.should.equal('a.md');
    });
  });
});