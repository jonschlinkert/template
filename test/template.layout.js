/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var _ = require('lodash');


describe('template layout', function () {
  describe('.layout()', function () {
    it('should add a layout to the cache.', function () {
      var template = new Template();
      template.layout('a', 'b');
      template.cache.layouts.should.have.property('a');
    });

    it('should add the second arg to the `content` property.', function () {
      var template = new Template();
      template.layout('a', 'b');
      template.cache.layouts.a.content.should.equal('b');
    });

    it('should add the third arg to the `data` property.', function () {
      var template = new Template();
      template.layout('a', 'b', {title: 'c'});
      template.cache.layouts.a.data.should.eql({title: 'c'});
    });

    it('should add a layout defined as an object to the cache.', function () {
      var template = new Template();
      template.layout({a: {content: 'b', data: {title: 'c'}}});
      template.cache.layouts.should.have.property('a');
      template.cache.layouts.a.content.should.equal('b');
      template.cache.layouts.a.data.should.eql({title: 'c'});
    });
  });
});