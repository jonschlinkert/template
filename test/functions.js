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
 * functions
 */

describe('when functions are passed on the context:', function () {
  it('should process templates recursively.', function () {
    var tmpl = helpers.read('test/fixtures/a.tmpl');
    var actual = template(tmpl, data);
    var expected = 'D here!';
    expect(actual).to.eql(expected);
  });


  describe('and no value is passed to the template.', function () {
    it('should use the function\'s default value.', function () {
      var tmpl = '<%= fn() %>';
      var actual = template(tmpl, data);
      var expected = 'FUNCTION!';
      expect(actual).to.eql(expected);
    });
  });

  describe('and a value is passed to the template.', function () {
    it('should use value that was passed.', function () {
      var tmpl = '<%= fn("VAL!") %>';
      var actual = template(tmpl, data);
      var expected = 'VAL!';
      expect(actual).to.eql(expected);
    });
  });

  describe('and the function is on a nested property.', function () {
    it('should use the function.', function () {
      var tmpl = '<%= two.three() %>';
      var actual = template(tmpl, data);
      var expected = 'THREE!!';
      expect(actual).to.eql(expected);
    });
  });

  it('should use the function.', function () {
    var tmpl = '<%= fn() %> <%= fn("VAL!") %> <%= two.three() %>';
    var actual = template(tmpl, data);
    var expected = 'FUNCTION! VAL! THREE!!';
    expect(actual).to.eql(expected);
  });

  it('should use the function.', function () {
    var tmpl = '<%= lower("FOO") %>';
    var actual = template(tmpl, data);
    expect(actual).to.eql('foo');
  });

  it('should use the function.', function () {
    var tmpl = '<%= new Date() %>';
    var actual = template(tmpl);
    var expected = actual.indexOf('GMT') !== -1;
    expect(expected).to.eql(true);
  });
});