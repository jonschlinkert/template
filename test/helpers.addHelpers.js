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

describe('.addHelperAsync():', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should register multiple sync helpers from an object:', function () {
    template.helpers({
      a: function() {},
      b: function() {},
      c: function() {},
      d: function() {},
    });
    template._.helpers.should.have.properties('a', 'b', 'c', 'd');
  });

  it('should register multiple sync helpers from an array:', function () {
    template.helpers([{
      a: function() {},
      b: function() {},
      c: function() {},
      d: function() {},
    }]);

    template.helpers([
      {e: function() {}},
      {f: function() {}}
    ]);
    template._.helpers.should.have.properties('a', 'b', 'c', 'd', 'e', 'f');
  });

  it('should register multiple sync helpers from a glob pattern:', function () {
    template.helpers('test/fixtures/helpers/*.js');
    template._.helpers.should.have.properties('a', 'b', 'c');
  });
});
