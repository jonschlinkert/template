/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template = new Template();

describe('cwd:', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should get the cwd.', function () {
    template.cwd.should.equal(process.cwd());
  });

  it('should set the cwd from options.cwd.', function () {
    template.option('cwd', __dirname);
    template.cwd.should.equal(__dirname);
  });

  it('should not set the cwd directly.', function () {
    template.cwd.should.equal(process.cwd());
    template.cwd = __dirname;
    template.cwd.should.not.equal(__dirname);
    template.cwd.should.equal(process.cwd());
  });
});
