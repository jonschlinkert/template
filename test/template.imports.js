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


describe('template.imports():', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should add an import by name:', function () {
    template.imports('foo', function (bar) {
      return bar + '-foo';
    });
    Object.keys(template._.imports).length.should.eql(1);
  });

  it('should get an import by name', function () {
    template.imports('foo', function (bar) {
      return bar + '-foo';      
    });
    template.imports('foo').should.be.a.function;
  });

  it('should get all imports', function () {
    template.imports('foo', function (bar) {
      return bar + '-foo';      
    });
    template.imports('bar', function (foo) {
      return foo + '-bar';
    });
    var imports = template.imports();
    Object.keys(imports).length.should.be.eql(2);
    imports.should.have.property('foo');
    imports.should.have.property('bar');
  });
});
