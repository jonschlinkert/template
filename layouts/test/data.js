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


describe('.data()', function () {
  layouts.setLayout('first', 'a', '{{body}}');
  layouts.setLayout('a', {layout: 'b', xyz: 'aaa', one: 'two'}, 'A above\n{{body}}\nA below');
  layouts.setLayout('b', {layout: 'c', xyz: 'bbb', three: 'four'}, 'B above\n{{body}}\nB below');
  layouts.setLayout('c', 'd', 'C above\n{{body}}\nC below');
  layouts.setLayout('d', 'e', 'D above\n{{body}}\nD below');
  layouts.setLayout('e', 'f', 'E above\n{{body}}\nE below');
  layouts.setLayout('f', 'last', 'F above\n{{body}}\nF below');
  layouts.setLayout('last', {xyz: 'zzz'}, 'last!\n{{body}}\nlast!');

  it('should return an extended data object from the flattened layouts.', function () {
    var actual = layouts.stack('first');
    var expected = [
      'last!',
      'F above',
      'E above',
      'D above',
      'C above',
      'B above',
      'A above',
      '{{body}}', // should not be compiled
      'A below',
      'B below',
      'C below',
      'D below',
      'E below',
      'F below',
      'last!'
    ].join('\n');
    actual.content.should.eql(expected);
    actual.data.should.eql({xyz: 'aaa', one: 'two', three: 'four'});
  });
});