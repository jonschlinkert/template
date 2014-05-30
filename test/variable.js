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


describe('when the `variable` setting is defined:', function () {
  it('should process templates with a custom variable.', function () {
    var tmpl = '<%= _cust.name %> <%= _cust.person.name %> <%= _cust.person.first.name %>';
    var actual = template(tmpl, data, {variable: '_cust'});
    var expected = 'Jon Jon Jon';
    expect(actual).to.eql(expected);
  });
});
