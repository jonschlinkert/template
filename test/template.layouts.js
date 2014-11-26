/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward
 * Licensed under the MIT License (MIT)
 */

'use strict';

var path = require('path');
var assert = require('assert');
var should = require('should');
var Template = require('..');
var template;

describe('template layout', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('.layouts()', function () {
    it('should add layouts defined as strings.', function () {
      template.layout('x.md', 'this is a layout');
      template.layout('y.md', 'this is a layout');
      template.layout('z.md', 'this is a layout');
      template.views.layouts.should.have.property('x.md');
      template.views.layouts.should.have.property('y.md');
      template.views.layouts.should.have.property('z.md');
    });

    it('should add layouts defined as glob patterns.', function () {
      template.layouts(['test/fixtures/layouts/matter/*.md']);
      template.views.layouts.should.have.property('a.md');
    });

    it('should use a custom rename function on layout keys:', function () {
      template.option('renameKey', function (filepath) {
        return path.basename(filepath, path.extname(filepath));
      });

      template.layouts(['test/fixtures/layouts/matter/*.md']);
      template.views.layouts.should.have.property('a');
      template.views.layouts.should.have.property('b');
      template.views.layouts.should.have.property('c');
    });

    it('should use a custom rename function on layout keys:', function () {
      template.option('renameKey', function (filepath) {
        return path.basename(filepath);
      });

      template.layouts(['test/fixtures/layouts/matter/*.md']);
      template.views.layouts.should.have.property('a.md');
      template.views.layouts.should.have.property('b.md');
      template.views.layouts.should.have.property('c.md');
    });

    it('should use a custom rename function on layout keys:', function () {
      template.option('renameKey', function (filepath) {
        return path.basename(filepath) + ':string';
      });

      template.layouts(['test/fixtures/layouts/matter/*.md']);

      template.views.layouts.should.have.property('a.md:string');
      template.views.layouts.should.have.property('b.md:string');
      template.views.layouts.should.have.property('c.md:string');
    });
  });

  describe('when a layout has front matter', function () {
    it('should parse the layout.', function () {
      template.layouts('a.md', '---\nname: AAA\n---\nThis is content.');
      template.views.layouts.should.have.property('a.md');
      template.views.layouts['a.md'].should.have.property.content;
      template.views.layouts['a.md'].content.should.equal('This is content.');
    });

    it('should parse the `content` value.', function () {
      template.layouts({'a.md': {path: 'a.md', content: '---\nname: AAA\n---\nThis is content.'}});
      template.views.layouts.should.have.property('a.md');
    });

    it('should merge `data` with front-matter data.', function () {
      template.layouts({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.views.layouts.should.have.property('a.md');
      template.views.layouts['a.md'].data.should.have.property('c');
      template.views.layouts['a.md'].data.name.should.equal('AAA');
    });

    it('should save both locals and front-matter data to the `file` object.', function () {
      template.layouts({'a.md': {content: '---\nname: AAA\n---\nThis is content.', name: 'BBB'}});
      template.views.layouts.should.have.property('a.md');
      template.views.layouts['a.md'].data.name.should.equal('AAA');
      template.views.layouts['a.md'].locals.name.should.equal('BBB');
    });

    it('should use the key as `file.path` if one does not exist.', function () {
      template.layouts({'a.md': {content: '---\nname: AAA\n---\nThis is content.', data: {c: 'c'}}});
      template.views.layouts.should.have.property('a.md');
      template.views.layouts['a.md'].path.should.equal('a.md');
    });
  });
});