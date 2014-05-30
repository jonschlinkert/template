/*
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert
 * Licensed under the MIT license.
 */
'use strict';


var expect = require('chai').expect;
var template = require('../index.js');


describe('when a plain string is passed:', function () {
  it('should process the template and return the string.', function () {
    var tmpl = '<%= "STRING" %>';
    var actual = template(tmpl);
    var expected = 'STRING';
    expect(actual).to.eql(expected);
  });
});
