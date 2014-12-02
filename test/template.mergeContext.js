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

describe('template.mergeContext()', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should use mergeContext function from options', function () {
    template.option('mergeContext', function (tmpl, locals) {
      return locals;
    });
    template.mergeContext({ foo: 'bar' }, { baz: 'bang' }).should.eql({ baz: 'bang' });
  });
});