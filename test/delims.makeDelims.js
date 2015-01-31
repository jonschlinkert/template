/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;

describe('.makeDelims():', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should make delims given an array:', function () {
    var delims = template.makeDelims(['{{', '}}']);
    delims.should.have.property('interpolate');
    delims.should.have.property('evaluate');
    delims.should.have.property('escape');
  });

  it('should get default delims:', function () {
    var delims = template.makeDelims('', {});
    delims.should.have.property('interpolate');
    delims.should.have.property('evaluate');
    delims.should.have.property('escape');
  });
});
