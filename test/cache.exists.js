/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Template = require('..');

describe('Template', function () {
  describe('exists():', function () {
    var template = new Template();
    var obj = {a: {b: {c: 1, d: '', e: null, f: undefined, 'g.h.i': 2}}};

    template.merge(obj);

    it('immediate property should exist.', function() {
      template.exists('a').should.be.ok;
    });
    it('nested property should exist.', function() {
      template.exists('a.b').should.be.ok;
    });
    it('nested property should exist.', function() {
      template.exists('a.b.c').should.be.ok;
    });
    it('nested property should exist.', function() {
      template.exists('a.b.d').should.be.ok;
    });
    it('nested property should exist.', function() {
      template.exists('a.b.e').should.be.ok;
    });
    it('nested property should exist.', function() {
      template.exists('a.b.f').should.be.ok;
    });
    it('literal backslash should escape period in property name.', function() {
      template.exists('a.b.g\\.h\\.i').should.be.ok;
    });
    it('nonexistent property should not exist.', function() {
      template.exists('x').should.be.false;
    });
    it('nonexistent property should not exist.', function() {
      template.exists('a.x').should.be.false;
    });
    it('nonexistent property should not exist.', function() {
      template.exists('a.b.x').should.be.false;
    });
  })
});
