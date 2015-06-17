/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
require('should');
var Template = require('./app');
var template;

describe('template view', function () {
  beforeEach(function () {
    template = new Template();
    template.create('pages');
    template.pages('a', {content: 'this is content...'});
  });
  
  describe('.getViews()', function () {
    it('should get a collection by its plural name.', function () {
      assert.equal(typeof template.getViews('pages'), 'object');
      template.getViews('pages').should.have.property('a');
    });

    it('should get a collection by its singular name.', function () {
      assert.equal(typeof template.getViews('page'), 'object');
      template.getViews('page').should.have.property('a');
    });

    it('should return an object if passed:', function () {
      var a = template.views.pages;
      template.getViews(a.a).should.eql(a.a);
    });
  });
  
  it('should `.getView()` default template types from the cache.', function () {
    template.getViews('partials').should.be.an.object;
    template.getViews('layouts').should.be.an.object;
    template.getViews('pages').should.be.an.object;
  });

  it('should `.getViews()` custom template types:', function () {
    template.create('doc');
    template.doc('abc', {content: 'This is a document'});
    template.getDoc('abc').should.be.an.object;
    template.getDoc('abc').should.have.property('content', 'This is a document');
    template.getDoc('abc').should.have.property('path', 'abc');

    template.create('include', { viewType: 'partial' });
    template.include('xyz', {content: 'This is an include.'});
    template.getInclude('xyz').should.be.an.object;
    template.getInclude('xyz').should.have.property('content', 'This is an include.');
    template.getInclude('xyz').should.have.property('path', 'xyz');
  });
});
