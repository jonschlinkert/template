/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var utils = require('../lib/utils');
var Template = require('..');
var template;


describe('utils', function() {
  beforeEach(function() {
    template = new Template();
  });

  describe('.firstOfType:', function () {
    it('should get the first template of the type `renderable` by default:', function () {
      template.create('post', { isRenderable: true });

      template.page('aaa.md', '<%= abc %>');
      template.post('aaa.md', '<%= abc %>');

      utils.firstOfType('aaa.md', template).should.have.property('options', {type: 'pages', isRenderable: true});
    });

    it('should get the first template of the given type:', function () {
      template.create('include', { isPartial: true });

      template.partial('aaa.md', '<%= abc %>');
      template.include('aaa.md', '<%= abc %>');

      utils.firstOfType('aaa.md', template, ['partial']).should.have.property('options', {type: 'partials', isPartial: true });
    });
  });
});
