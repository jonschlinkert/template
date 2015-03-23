/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('./app');


describe('.addDelims():', function () {
  it('should register delimiters:', function () {
    var template = new Template();
    Object.keys(template.delims).should.have.length(1);

    template.addDelims('curly', ['{{', '}}']);
    Object.keys(template.delims).should.have.length(2);

    template.addDelims('angle', ['<%', '%>']);
    Object.keys(template.delims).should.have.length(3);

    template.addDelims('square', ['\\[\\[', '\\]\\]']);
    Object.keys(template.delims).should.have.length(4);
  });
});
