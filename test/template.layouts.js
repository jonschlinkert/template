/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var _ = require('lodash');


describe('template layout', function () {
  describe('.layout(): defined as strings', function () {
    it('should add a layout to the cache.', function () {
      var template = new Template();

      template.layout('x', 'this is a layout');
      template.layout('y', 'this is a layout');
      template.layout('z', 'this is a layout');
      // template.layouts(['test/fixtures/layouts/*.md']);
      // template.cache.layouts.should.have.property('a');
    });
  });
});