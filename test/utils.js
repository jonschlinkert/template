/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var utils = require('../lib/utils');
var Template = require('./app');
var template;

describe('template utils', function() {
  beforeEach(function() {
    template = new Template();
  });

  describe.skip('.firstOfType:', function () {
    it('should get the first template of the type `renderable` by default:', function () {
      template.create('post', { viewType: 'renderable' });
      template.page('aaa.md', '<%= abc %>');
      template.post('aaa.md', '<%= abc %>');
      // console.log(template.findRenderable('aaa.md'))

      template.findRenderable('aaa.md').should.have.property('contexts');
      template.findRenderable('aaa.md').contexts.should.have.property('create');
      template.findRenderable('aaa.md').contexts.create.should.eql({
        loaderType: 'sync',
        fallback: 'page',
        lastLoader: 'pages',
        viewType: ['renderable'],
        collection: 'pages',
        inflection: 'page'
      });

      template.findRenderable('aaa.md', ['posts']).should.have.property('contexts');
    });

    it('should get the first template of the given collection:', function () {
      template.create('include', { viewType: 'partial' });
      template.partial('aaa.md', '<%= abc %>');
      template.include('aaa.md', '<%= abc %>');

      template.findPartial('aaa.md', ['partials']).should.have.property('contexts');
      template.findPartial('aaa.md', ['partials']).contexts.should.have.property('create');
      template.findPartial('aaa.md', ['partials']).contexts.create.should.eql({
        loaderType: 'sync',
        fallback: 'partial',
        lastLoader: 'partials',
        viewType: ['partial'],
        collection: 'partials',
        inflection: 'partial'
      });
    });

    it('should get the first template based on the order of the passed array:', function () {
      template.create('include', { viewType: 'partial' });
      template.create('snippet', { viewType: 'partial' });

      template.partial('aaa.md', '<%= abc %>');
      template.include('aaa.md', '<%= abc %>');
      template.snippet('aaa.md', '<%= abc %>');

      template.findPartial('aaa.md', ['partials', 'snippets', 'includes']).should.have.property('content');

      var snippets = ['snippets', 'partials', 'includes'];
      template.findPartial('aaa.md', snippets).should.have.property('content');
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
