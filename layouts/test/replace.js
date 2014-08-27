/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Layouts = require('..');


describe('.replace():', function () {
  var layouts = new Layouts();

  layouts.setLayout({first: { layout: 'last', content: '{{body}}' }});
  layouts.setLayout({last: { content: 'LAST above\n{{body}}\nLAST below' }});

  it('should replace the `{{body}}` tag in a layout with the given content.', function () {
    var stack = layouts.stack('first');
    var actual = layouts.replaceTag('aaa bbb ccc', stack.content);
    var expected = 'LAST above\naaa bbb ccc\nLAST below';
    actual.should.eql(expected);
  });

  it('should replace the `{{body}}` tag in a layout with the given content.', function () {
    var actual = layouts.replaceTag('aaa bbb ccc', 'before\n{{body}}\nafter');
    var expected = 'before\naaa bbb ccc\nafter';
    actual.should.eql(expected);
  });

  it('should leave the "last" `{{body}}` tag if no other layout is defined.', function () {
    var actual = layouts.replaceTag('aaa {{body}} ccc', 'before\n{{body}}\nafter');
    var expected = 'before\naaa {{body}} ccc\nafter';
    actual.should.eql(expected);
  });
});
