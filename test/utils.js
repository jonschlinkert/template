/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var utils = require('../lib');
var Template = require('./app');
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
      template.findRenderable('aaa.md').options.should.have.property('create');
      template.findRenderable('aaa.md').options.create.should.eql({collection: 'pages', isRenderable: true, subtype: 'page'});

      template.findRenderable('aaa.md', ['posts']).should.have.property('options');
    });

    it('should get the first template of the given subtype:', function () {
      template.create('include', { isPartial: true });
      template.partial('aaa.md', '<%= abc %>');
      template.include('aaa.md', '<%= abc %>');

      template.findPartial('aaa.md', ['partials']).should.have.property('options');
      template.findPartial('aaa.md', ['partials']).options.should.have.property('create');
      template.findPartial('aaa.md', ['partials']).options.create.should.eql({collection: 'partials', isPartial: true, subtype: 'partial'});
    });

    it('should get the first template based on the order of the passed array:', function () {
      template.create('include', { isPartial: true });
      template.create('snippet', { isPartial: true });

      template.partial('aaa.md', '<%= abc %>');
      template.include('aaa.md', '<%= abc %>');
      template.snippet('aaa.md', '<%= abc %>');

      template.findPartial('aaa.md', ['partials', 'snippets', 'includes']).should.have.property('options');
      template.findPartial('aaa.md', ['partials', 'snippets', 'includes']).options.should.have.property('create');
      template.findPartial('aaa.md', ['partials', 'snippets', 'includes']).options.create.should.have.property('subtype');
      template.findPartial('aaa.md', ['partials', 'snippets', 'includes']).options.create.should.have.property('isPartial');

      template.findPartial('aaa.md', ['snippets', 'partials', 'includes']).should.have.property('options');
      template.findPartial('aaa.md', ['snippets', 'partials', 'includes']).options.should.have.property('create');
      template.findPartial('aaa.md', ['snippets', 'partials', 'includes']).options.create.should.eql({ collection: 'snippets', isPartial: true, subtype: 'snippet' });
      template.findPartial('aaa.md', ['snippets', 'partials', 'includes']).options.create.should.have.property('isPartial');
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

  describe('.camelcase', function () {
    describe('when a single letter is passed', function () {
      it('should return the single letter', function () {
        utils.camelcase('a').should.eql('a');
      });
    });
    describe('when a name with a dash or underscore is passed', function () {
      it('should return a single camelcased name', function () {
        utils.camelcase('foo-bar').should.eql('fooBar');
        utils.camelcase('foo_bar').should.eql('fooBar');
      });
    });
  });
});
