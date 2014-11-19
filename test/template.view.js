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
var template;

describe('template view', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should `.view()` default template types from the cache.', function () {
    template.view('partials').should.be.an.object;
    template.view('layouts').should.be.an.object;
    template.view('pages').should.be.an.object;
  });

  it('should `.view()` custom template types:', function () {
    template.create('doc', 'docs');
    template.doc('abc', {content: 'This is a document'});
    template.getDoc('abc').should.be.an.object;
    template.getDoc('abc').should.have.property('content', 'This is a document');
    template.getDoc('abc').should.have.property('path', 'abc');


    template.create('include', 'includes');
    template.include('xyz', {content: 'This is an include.'});
    template.getInclude('xyz').should.be.an.object;
    template.getInclude('xyz').should.have.property('content', 'This is an include.');
    template.getInclude('xyz').should.have.property('path', 'xyz');
  });
});