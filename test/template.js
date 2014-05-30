/*
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert
 * Licensed under the MIT license.
 */
'use strict';

var expect = require('chai').expect;
var _ = require('lodash');
var template = require('../index.js');
var helpers = require('./helpers/helpers');
var data = helpers.data;

_.mixin(data);


describe('when _.template is used:', function () {
  it('should process templates with default delimiters.', function () {
    var compiled = _.template('hello <%= name %>');
    compiled({ 'name': 'Jon Schlinkert' });

    var actual = compiled({ 'name': 'Jon Schlinkert' });
    expect(actual).to.eql('hello Jon Schlinkert');
  });

  it('should process templates with es6 delimiters.', function () {
    var compiled = _.template('hello ${ name }');
    compiled({ 'name': 'Jon Schlinkert' });

    var actual = compiled({ 'name': 'Jon Schlinkert' });
    expect(actual).to.eql('hello Jon Schlinkert');
  });
});
