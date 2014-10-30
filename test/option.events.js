/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;


describe('option events', function() {
  beforeEach(function () {
    template = new Template();
  });

  it('should emit `option` when a value is set', function () {
    template.once('option', function (key, val) {
      template.option('a', 'b');
    });
    template.option('foo', 'bar');
    template.options.should.have.property('foo');
    template.options.should.have.property('a');
  });

  it('should emit `option` when an object is set', function () {
    template.once('option', function (key, val) {
      template.option('a', 'b');
    });
    template.option({foo: 'bar'});
    template.options.should.have.property('foo');
    template.options.should.have.property('a');
  });
});
