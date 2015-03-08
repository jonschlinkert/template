/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
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
    (Object.keys(template.transform()).length > 0).should.be.true;
  });
  it('should get a transform by name.', function () {
    template.transform('templates').should.be.a.function;
    template.transform('engines').should.be.a.function;
  });
});
