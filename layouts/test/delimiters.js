/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Layouts = require('..');


describe('layout delimiters', function () {
  var layouts = new Layouts();

  it('should use custom delimiters.', function () {
    var actual = layouts.replaceTag('INNER', '{{body}}[[body]]{%body%}{% body %}<%body%>', {delims: ['{%', '%}']});
    var expected = '{{body}}[[body]]INNERINNER<%body%>';
    actual.should.eql(expected);
  });
  it('should use custom delimiters.', function () {
    var actual = layouts.replaceTag('INNER', '{{body}}[[body]]{%body%}{% body %}<%body%>', {delims: ['{{', '}}']});
    var expected = 'INNER[[body]]{%body%}{% body %}<%body%>';
    actual.should.eql(expected);
  });
  it('should use custom delimiters.', function () {
    var actual = layouts.replaceTag('INNER', '{{body}}[[body]]{%body%}{% body %}<%body%>', {delims: ['[[', ']]']});
    var expected = '{{body}}INNER{%body%}{% body %}<%body%>';
    actual.should.eql(expected);
  });
  it('should use custom delimiters.', function () {
    var actual = layouts.replaceTag('INNER', '{{body}}[[body]]{%body%}{% body %}<%body%>', {delims: ['<%', '%>']});
    var expected = '{{body}}[[body]]{%body%}{% body %}INNER';
    actual.should.eql(expected);
  });
});
