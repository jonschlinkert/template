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

describe('when mixins are mixed into Lo-Dash:', function () {
  it('should use the mixins in templates.', function () {
    var tmpl = '<%= _.getVal("baz") %>';
    var actual = template(tmpl, data);
    var expected = 'baz';
    expect(actual).to.eql(expected);
  });

  it('should use the mixin\'s default value if no arguments are passed.', function () {
    var tmpl = '<%= _.getVal() %>';
    var actual = template(tmpl, data);
    var expected = 'DEFAULT!';
    expect(actual).to.eql(expected);
  });

  it('should process templates recursively.', function () {
    var tmpl = helpers.read('test/fixtures/_a.tmpl');
    var actual = template(tmpl, data);
    var expected = 'C here!';
    expect(actual).to.eql(expected);
  });
});



describe('when functions and mixins are both used in templates:', function () {
  it('should process templates recursively.', function () {
    var tmpl = helpers.read('test/fixtures/a.tmpl');
    var actual = template(tmpl, data);
    var expected = 'D here!';
    expect(actual).to.eql(expected);
  });
});


describe('Mixin methods from underscore.string:', function () {
  it('should slugify the string with _.str namespace', function () {
    var tmpl = '<%= _.slugify("This should be slugified") %>';
    var actual = template(tmpl);
    expect(actual).to.eql('this-should-be-slugified');
  });

  it('should slugify the string.', function () {
    var tmpl = '<%= _.slugify("This should be slugified") %>';
    var actual = template(tmpl, null, {nonconflict: true});
    expect(actual).to.eql('this-should-be-slugified');
  });

  it('should slugify the string with a mixin on the _.str namespace.', function () {
    var tmpl = '<%= _.str.slugify("This should be slugified") %>';
    var actual = template(tmpl, null, {nonconflict: true});
    expect(actual).to.eql('this-should-be-slugified');
  });

  it('should titleize the string with a mixin on the _.str namespace', function () {
    var tmpl = '<%= _.str.titleize("This should be titleized") %>';
    var actual = template(tmpl);
    expect(actual).to.eql('This Should Be Titleized');
  });

  it('should titleize the string.', function () {
    var tmpl = '<%= _.str.titleize("This should be titleized") %>';
    var actual = template(tmpl, null, {nonconflict: true});
    expect(actual).to.eql('This Should Be Titleized');
  });
});

