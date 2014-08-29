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


describe('template partial', function () {
  describe('.partial()', function () {
    it('should add a partial to the cache.', function () {
      var template = new Template();
      template.partial('a', 'b');
      template.cache.partials.should.have.property('a');
    });

    it('should add the second arg to the `content` property.', function () {
      var template = new Template();
      template.partial('a', 'b');
      template.cache.partials.a.content.should.equal('b');
    });

    it('should add the third arg to the `data` property.', function () {
      var template = new Template();
      template.partial('a', 'b', {title: 'c'});
      template.cache.partials.a.data.should.eql({title: 'c'});
    });

    it('should add a partial defined as an object to the cache.', function () {
      var template = new Template();
      template.partial({a: {content: 'b', data: {title: 'c'}}});
      template.cache.partials.should.have.property('a');
      template.cache.partials.a.content.should.equal('b');
      template.cache.partials.a.data.should.eql({title: 'c'});
    });
  });
});