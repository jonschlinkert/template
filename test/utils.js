/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
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
});
