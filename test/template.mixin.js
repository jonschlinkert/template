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


describe('template.mixin():', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should add a mixin by name:', function () {
    template.mixin('foo', function (bar) {
      return bar + '-foo';
    });
    Object.keys(template._.mixins).length.should.eql(1);
  });

  it('should get a mixin by name', function () {
    template.mixin('foo', function (bar) {
      return bar + '-foo';
    });
    template.mixin('foo').should.be.a.function;
  });

  it('should get all mixins', function () {
    template.mixin('foo', function (bar) {
      return bar + '-foo';
    });
    template.mixin('bar', function (foo) {
      return foo + '-bar';
    });
    var mixins = template.mixin();
    Object.keys(mixins).length.should.be.eql(2);
    mixins.should.have.property('foo');
    mixins.should.have.property('bar');
  });
});
