/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template = new Template();

describe('default transforms:', function () {
  beforeEach(function () {
    template = new Template();
  });
  it('should get all the transforms.', function () {
    var transforms = template.transform();
    Object.keys(transforms).length.should.eql(1);
  });
  it('should get a transform by name.', function () {
    var fn = template.transform('placeholder');
    (typeof fn === 'function').should.be.true;
  });
});
