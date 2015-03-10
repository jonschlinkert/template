/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var Template = require('..');
var template;

describe('template data', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('.data():', function () {
    it('should load data from an object:', function () {
      template.data({ a: 'a', b: 'b', c: 'c' });
      template.cache.data.should.eql({ a: 'a', b: 'b', c: 'c' });
    });

    it('should load data from a JSON file:', function () {
      template.data('test/fixtures/data/a.json');
      template.cache.data.should.eql({ a: { a: 'a', b: 'b', c: 'c' } });
    });

    it('should load data from a YAML file:', function () {
      template.data('test/fixtures/data/x.yml');
      template.cache.data.should.eql({ x: { x: 'x', y: 'y', z: 'z' } });
    });

    it('should load data from a glob pattern:', function () {
      template.data('test/fixtures/data/{a,x}.*');
      template.cache.data.should.eql({a: { a: 'a', b: 'b', c: 'c' }, x: { x: 'x', y: 'y', z: 'z' }});
    });

    it('should merge data from a function:', function () {
      template.data('test/fixtures/data/data.json', function (fp) {
        var data = {};
        data[path.basename(fp, path.extname(fp))] = require(path.resolve(fp));
        return data;
      });
      template.cache.data.should.eql({ '_root': 'I should be at the root!' });
    });
  });

  describe('template.cache.data:', function () {
    it('should store data on `cache.data`:', function () {
      template.data({ a: 'a', b: 'b', c: 'c' });
      template.cache.data.should.have.property('a', 'a');
    });

    it('should `.get()` data from the cache:', function () {
      template.data({ a: 'a', b: 'b', c: 'c' });
      template.get('data').should.have.property('a', 'a');
    });

    it('should `.get()` data properties from the cache:', function () {
      template.data({ a: { b: { c: 'd'} } });
      template.get('data.a.b.c').should.equal('d');
    });

    it('should `.set()` data on the cache:', function () {
      template.set('data', { a: 'a', b: 'b', c: 'c' });
      template.get('data').should.have.property('a', 'a');
    });
  });
});
