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

describe('settings', function () {
  describe('constructor:', function () {
    it('when new Template() is defined:', function () {
      var template = new Template();
      template.should.be.instanceOf(Template);
      template.settings.should.be.eql({ data: {} });
      template._.settings.should.be.instanceOf(Config);
    });
  });

  describe('get/set:', function () {
    var template = null;

    beforeEach(function () {
      template = new Template();
    });

    describe('set() - add:', function () {
      it('should set a new property with the given value', function () {
        template._.settings.set('one', 1);
        template._.settings.get('one').should.eql(1);
      });
    });

    describe('set() - update:', function () {
      it('should update an existing property with the given value', function () {
        template._.settings.set('one', 2);
        template._.settings.get('one').should.eql(2);
      });

      it('should get the given property', function () {
        template._.settings.set('a', 'b');
        template._.settings.get('a').should.eql('b');
      });
    });
  });

  describe('set()/get():', function () {
    var template = new Template();
    it('should return immediate property value.', function() {
      template._.settings.set('a', 1);
      template._.settings.get('a').should.eql(1)
    });
    it('should set property value.', function() {
      template.settings.a.should.eql(1);
    });
    it('should return nested property value.', function() {
      template._.settings.set('b.c.d', 1);
      template._.settings.get('b.c.d').should.eql(1);
    });
    it('should set property value.', function() {
      template.settings.b.c.d.should.eql(1);
    });
    it('literal backslash should escape period in property name.', function() {
      template._.settings.set('e\\.f\\.g', 1);
      template._.settings.get('e\\.f\\.g', true).should.eql(1);
      template.settings['e.f.g'].should.eql(1);
    });
  });
});
