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


/**
 * native `_.template` doesn't process recursively
 */

describe('when _.template is passed nested templates:', function () {
  it('should return an unprocessed template string and not process templates recursively.', function () {
    var tmpl = helpers.read('test/fixtures/_a.tmpl');
    var actual = _.template(tmpl, data);
    var expected = '<%= _.include("test/fixtures/_c.tmpl") %>';
    expect(actual).to.eql(expected);
  });
});

