/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;

describe('template.getExt()', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should get the ext from a custom function.', function () {
    template.option('getExt', function () {
      return '.custom';
    });
    template.getExt().should.eql('.custom');
  });

  it('should get `null` when no `ext` properties are found.', function () {
    template.option('viewEngine', undefined);
    var page = {
      options: {}
    };
    var locals = {};
    (template.getExt(page, locals) == null).should.be.true;
  });
});