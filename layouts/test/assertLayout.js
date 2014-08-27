/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var _ = require('lodash');
var Layouts = require('..');
var layouts = new Layouts();

describe('.assertLayout()', function () {
  it('should return correct values when defaultLayout is provided', function () {
    var defaultLayout = 'default';
    var actual = [
      undefined,
      null,
      true,
      false,
      'false',
      'null',
      'nil',
      'default',
      'base',
      '2-col-side-nav'
    ].map(function (layout) {
      return layouts.assertLayout(layout, defaultLayout);
    });

    var expected = [
      'default',        // undefined
      'default',        // null
      'default',        // true
      null,             // false
      null,             // 'false'
      null,             // 'null'
      null,             // 'nil'
      'default',        // 'default'
      'base',           // 'base'
      '2-col-side-nav'  // '2-col-side-nav'
    ];
    actual.should.eql(expected);
  });

  it('should return correct values when defaultLayout is not provided', function () {
    var defaultLayout = undefined;
    var actual = [
      undefined,
      null,
      true,
      false,
      'false',
      'null',
      'nil',
      'default',
      'base',
      '2-col-side-nav'
    ].map(function (layout) {
      return layouts.assertLayout(layout, defaultLayout);
    });

    var expected = [
      null,             // undefined
      null,             // null
      null,             // true
      null,             // false
      null,             // 'false'
      null,             // 'null'
      null,             // 'nil'
      'default',        // 'default'
      'base',           // 'base'
      '2-col-side-nav'  // '2-col-side-nav'
    ];
    actual.should.eql(expected);
  });
});