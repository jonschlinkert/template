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


describe('template page', function () {
  describe('.page()', function () {
    it('should add a page to the cache.', function () {
      var template = new Template();
      template.page('a', 'b');
      template.cache.pages.should.have.property('a');
    });

    it('should add the second arg to the `content` property.', function () {
      var template = new Template();
      template.page('a', 'b');
      template.cache.pages.a.content.should.equal('b');
    });

    it('should add the third arg to the `data` property.', function () {
      var template = new Template();
      template.page('a', 'b', {title: 'c'});
      template.cache.pages.a.data.should.eql({title: 'c'});
    });

    it('should add a page defined as an object to the cache.', function () {
      var template = new Template();
      template.page({a: {content: 'b', data: {title: 'c'}}});
      template.cache.pages.should.have.property('a');
      template.cache.pages.a.content.should.equal('b');
      template.cache.pages.a.data.should.eql({title: 'c'});
    });
  });
});