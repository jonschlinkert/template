/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var Config = require('config-cache');
var should = require('should');
var Template = require('..');

describe('defaults', function () {
  describe('constructor:', function () {
    it('when new Template() is defined:', function () {
      var template = new Template();
      template.should.be.instanceOf(Template);
    });
  });

  describe('get/set:', function () {
    var template = null;

    beforeEach(function () {
      template = new Template();
    });

    describe('set() - add:', function () {
      it('should set a new property with the given value', function () {
        template.defaults('one', 1);
        template.defaults('one').should.eql(1);
      });
    });

    describe('set() - update:', function () {
      it('should update an existing property with the given value', function () {
        template.defaults('one', 2);
        template.defaults('one').should.eql(2);
      });

      it('should get the given property', function () {
        template.defaults('a', 'b');
        template.defaults('a').should.eql('b');
      });
    });
  });

  describe('set()/get():', function () {
    var template = new Template();
    it('should return immediate property value.', function() {
      template.defaults('a', 1);
      template.defaults('a').should.eql(1)
    });
    it('should set property value.', function() {
      template._.defaults.a.should.eql(1);
    });
  });
});
