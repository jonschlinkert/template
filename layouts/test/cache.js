/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Layouts = require('..');


describe('layouts cache', function () {
  it('should add layouts to the cache when passed to `new Layouts`.', function () {
    var layouts = new Layouts({
      cache: {
        first: { layout: 'a', content: 'I\'m a {{ title }}' },
        a: { layout: 'b', content: 'A above\n{{body}}\nA below' },
        b: { layout: 'c', content: 'B above\n{{body}}\nB below' },
        c: { layout: 'd', content: 'C above\n{{body}}\nC below' },
        d: { layout: 'e', content: 'D above\n{{body}}\nD below' },
        e: { layout: 'f', content: 'E above\n{{body}}\nE below' },
        f: { layout: 'last', content: 'F above\n{{body}}\nF below' },
        last: { layout: undefined, content: 'last!\n{{body}}\nlast!' }
      }
    });
    Object.keys(layouts.cache).length.should.eql(8);
  });

  it('should add layouts to the cache when using `.setLayout()`.', function () {
    var layouts = new Layouts();

    layouts.setLayout('first', 'a', 'I\'m a {{ title }}');
    layouts.setLayout('a', 'b', 'A above\n{{body}}\nA below');
    layouts.setLayout('b', 'c', 'B above\n{{body}}\nB below');
    layouts.setLayout('c', 'd', 'C above\n{{body}}\nC below');
    layouts.setLayout('d', 'e', 'D above\n{{body}}\nD below');
    layouts.setLayout('e', 'f', 'E above\n{{body}}\nE below');
    layouts.setLayout('f', 'last', 'F above\n{{body}}\nF below');
    layouts.setLayout('last', undefined, 'last!\n{{body}}\nlast!');
    Object.keys(layouts.cache).length.should.eql(8);
  });
});