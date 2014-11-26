/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');

var camelize = require('../lib/camelize');
var utils = require('../lib');
var Template = require('..');
var template;


describe('template utils', function() {
  beforeEach(function() {
    template = new Template();
  });

  describe('.firstOfType:', function () {
    it('should get the first template of the subtype `renderable` by default:', function () {
      template.create('post', { isRenderable: true });
      template.page('aaa.md', '<%= abc %>');
      template.post('aaa.md', '<%= abc %>');

      template.findRenderable('aaa.md').should.have.property('options');
      template.findRenderable('aaa.md').options.should.have.property('subtype', 'pages');
      template.findRenderable('aaa.md').options.should.have.property('isRenderable', true);
      template.findRenderable('aaa.md', ['posts']).should.have.property('options');
      template.findRenderable('aaa.md', ['posts']).options.should.have.property('subtype', 'posts');
      template.findRenderable('aaa.md', ['posts']).options.should.have.property('isRenderable', true);
    });

    it('should get the first template of the given subtype:', function () {
      template.create('include', { isPartial: true });
      template.partial('aaa.md', '<%= abc %>');
      template.include('aaa.md', '<%= abc %>');

      template.findPartial('aaa.md', ['partials']).should.have.property('options');
      template.findPartial('aaa.md', ['partials']).options.should.have.property('subtype', 'partials');
      template.findPartial('aaa.md', ['partials']).options.should.have.property('isPartial', true);
    });

    it('should get the first template based on the order of the passed array:', function () {
      template.create('include', { isPartial: true });
      template.create('snippet', { isPartial: true });

      template.partial('aaa.md', '<%= abc %>');
      template.include('aaa.md', '<%= abc %>');
      template.snippet('aaa.md', '<%= abc %>');

      template.findPartial('aaa.md', ['partials', 'snippets', 'includes']).should.have.property('options');
      template.findPartial('aaa.md', ['partials', 'snippets', 'includes']).options.should.have.property('subtype', 'partials');
      template.findPartial('aaa.md', ['partials', 'snippets', 'includes']).options.should.have.property('isPartial', true);

      template.findPartial('aaa.md', ['snippets', 'partials', 'includes']).should.have.property('options');
      template.findPartial('aaa.md', ['snippets', 'partials', 'includes']).options.should.have.property('subtype', 'snippets');
      template.findPartial('aaa.md', ['snippets', 'partials', 'includes']).options.should.have.property('isPartial', true);
    });
  });

  describe('.runLoaderStack', function () {
    it('should throw an error when a callback is not passed in.', function (done) {
      try {
        utils.runLoaderStack([]);
        done(new Error('Expected an error to be thrown.'));
      } catch (err) {
        if (err && err.message === 'Expected cb to be a function') return done();
        done(new Error('Expected an error to be thrown.'));
      }
    });

    it('should throw an error when stack is not an array.', function (done) {
      utils.runLoaderStack('foo', function (err) {
        if (err && err.message === 'Expected stack to be an Array') return done();
        done(new Error('Expected an error to be thrown.'));
      });;
    });
  });

  describe('.formatExt', function () {
    it('should add a dot to the front of an extension', function () {
      utils.formatExt('hbs').should.eql('.hbs');
    });
    it('should return the same extension when a dot already exists', function () {
      utils.formatExt('.hbs').should.eql('.hbs');
    });
  });

  describe('.getExt', function () {
    it('should get the extension', function () {
      utils.getExt('filename.hbs').should.eql('hbs');
    });
  });

  describe('.camelize', function () {
    describe('when a dot separated name is passed', function () {
      it('should return the first segment', function () {
        camelize('foo.bar').should.eql('foo');
      });
    });
    describe('when a single letter is passed', function () {
      it('should return the single letter', function () {
        camelize('a').should.eql('a');
      });
    });
    describe('when a name with a dash or underscore is passed', function () {
      it('should return a single camelized name', function () {
        camelize('foo-bar').should.eql('fooBar');
        camelize('foo_bar').should.eql('fooBar');
      });
    });
  });
});
