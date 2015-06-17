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
