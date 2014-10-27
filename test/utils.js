/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var utils = require('../lib/utils');
var Engine = require('..');
var engine;


describe('utils', function() {
  beforeEach(function() {
    engine = new Engine();
  });

  describe('.firstOfType:', function () {
    it('should get the first template of the type `renderable` by default:', function () {
      engine.create('post', { isRenderable: true });

      engine.page('aaa.md', '<%= abc %>');
      engine.post('aaa.md', '<%= abc %>');

      utils.firstOfType('aaa.md', engine).should.have.property('options', {type: 'pages', isRenderable: true});
    });

    it('should get the first template of the given type:', function () {
      engine.create('include', { isPartial: true });

      engine.partial('aaa.md', '<%= abc %>');
      engine.include('aaa.md', '<%= abc %>');

      utils.firstOfType('aaa.md', engine, ['partial']).should.have.property('options', {type: 'partials', isPartial: true });
    });
  });
});
