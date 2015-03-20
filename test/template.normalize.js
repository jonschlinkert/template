/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('./app');
var template;

describe('template.normalize()', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should use normalize function from options', function () {
    template.option('normalize', function (plural, tmpl, options) {
      return tmpl;
    });
    template.normalize('pages', { foo: 'bar' }, {}).should.eql({ foo: 'bar' });
  });
});
