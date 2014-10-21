/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Engine = require('..');


describe('template get', function () {
  it('should `.get()` default template types from the cache.', function () {
    var template = new Engine();
    template.get('partials').should.be.an.object;
    template.get('layouts').should.be.an.object;
    template.get('pages').should.be.an.object;
  });

  it('should `.get()` custom template types:', function () {
    var template = new Engine();
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