/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Layouts = require('..');


describe('.stack() with properties:', function () {
  describe('when layouts are defined as objects with their own properties:', function () {
    var layouts = new Layouts();

    layouts.setLayout({first: { layout: 'a', content: '{{body}}' }});
    layouts.setLayout({a: { layout: 'b', a: 'b', title: 'A', content: '{{ title }} above\n{{body}}\n{{ title }} below' }});
    layouts.setLayout({b: { layout: 'c', c: 'd', title: 'B', content: '{{ title }} above\n{{body}}\n{{ title }} below' }});
    layouts.setLayout({c: { layout: 'd', e: 'f', title: 'C', content: '{{ title }} above\n{{body}}\n{{ title }} below' }});
    layouts.setLayout({d: { layout: 'e', g: 'h', title: 'D', content: '{{ title }} above\n{{body}}\n{{ title }} below' }});
    layouts.setLayout({e: { layout: 'f', i: 'j', title: 'E', content: '{{ title }} above\n{{body}}\n{{ title }} below' }});
    layouts.setLayout({f: { layout: 'last', data: {one: 'two'}, title: 'F', content: '{{ title }} above\n{{body}}\n{{ title }} below' }});
    layouts.setLayout({last: { layout: undefined, content: 'last!\n{{body}}\nlast!' }});

    it('should return a layout stack.', function () {
      var stack = layouts.stack('first');
      var expected = [
        'last!',
        'F above',
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        '{{body}}',
        'A below',
        'B below',
        'C below',
        'D below',
        'E below',
        'F below',
        'last!'
      ].join('\n');
      stack.content.should.eql(expected);
    });

    it('should return a `data` object with.', function () {
      var stack = layouts.stack('first');
      stack.data.should.eql({
        a: 'b',
        c: 'd',
        e: 'f',
        g: 'h',
        i: 'j',
        one: 'two',
        title: 'A'
      });
    });
  });

  describe('when layouts are defined with string values:', function () {
    var layouts = new Layouts();

    layouts.setLayout('first', 'a', '{{body}}');
    layouts.setLayout('a', 'b', 'A above\n{{body}}\nA below');
    layouts.setLayout('b', 'c', 'B above\n{{body}}\nB below');
    layouts.setLayout('c', 'd', 'C above\n{{body}}\nC below');
    layouts.setLayout('d', 'e', 'D above\n{{body}}\nD below');
    layouts.setLayout('e', 'f', 'E above\n{{body}}\nE below');
    layouts.setLayout('f', 'last', 'F above\n{{body}}\nF below');
    layouts.setLayout('last', undefined, 'last!\n{{body}}\nlast!');

    it('should build a layout stack', function () {
      var actual = layouts.stack('first');
      var expected = [
        'last!',
        'F above',
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        '{{body}}',
        'A below',
        'B below',
        'C below',
        'D below',
        'E below',
        'F below',
        'last!'
      ].join('\n');

      actual.content.should.eql(expected);
    });
  });
});
