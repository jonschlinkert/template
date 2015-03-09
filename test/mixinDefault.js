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


describe('template.mixinDefault', function() {
  beforeEach(function() {
    template = new Template();
  });

  it('should set the function on the defaults', function () {
    template.mixinDefault('foo', function () {
      return 'foo';
    });
    template._.defaults.should.have.property('foo');
    template._.defaults.foo.should.be.a.function;
    template._.defaults.foo().should.eql('foo');
    template.should.have.property('foo');
    template.foo.should.be.a.function;
    template.foo().should.eql('foo');
  });

  it('should call the function set on options', function () {
    template.mixinDefault('foo', function () {
      return 'foo';
    });
    template.foo().should.eql('foo');
    template.option('foo', function () {
      return 'bar';
    });
    template.foo().should.eql('bar');
  });

  it('should return a primative when not a function', function () {
    template.mixinDefault('foo', { bar: 'baz' });
    template.foo().should.eql({ bar: 'baz' });
  });
});
