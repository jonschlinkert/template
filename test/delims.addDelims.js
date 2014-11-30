/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');


describe('.addDelims():', function () {
  it('should addDelims template by `name` on `template`:', function () {
    var template = new Template();
    Object.keys(template.delims).should.have.length(1);

    template.addDelims('hbs', ['{{', '}}']);
    Object.keys(template.delims).should.have.length(2);

    template.addDelims('lodash', ['<%', '%>']);
    Object.keys(template.delims).should.have.length(3);

    template.addDelims('square', ['[[', ']]']);
    Object.keys(template.delims).should.have.length(4);
  });
});
