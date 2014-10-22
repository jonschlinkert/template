/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var Engine = require('..');
var engine;

describe('engine data', function () {
  beforeEach(function () {
    engine = new Engine();
  });

  describe('.data():', function () {
    it('should load data from an object:', function () {
      engine.data({ a: 'a', b: 'b', c: 'c' });
      engine.cache.data.should.eql({ a: 'a', b: 'b', c: 'c' });
    });

    it('should load data from a JSON file:', function () {
      engine.data('test/fixtures/data/a.json');
      engine.cache.data.should.eql({ a: 'a', b: 'b', c: 'c' });
    });

    it('should load data from a YAML file:', function () {
      engine.data('test/fixtures/data/x.yml');
      engine.cache.data.should.eql({ x: 'x', y: 'y', z: 'z' });
    });

    it('should load data from a glob pattern:', function () {
      engine.data('test/fixtures/data/{a,x}.*');
      engine.cache.data.should.eql({ a: 'a', b: 'b', c: 'c', x: 'x', y: 'y', z: 'z' });
    });

    it('should merge data from `data` into the root of the context:', function () {
      engine.data('test/fixtures/data/data.json');
      engine.cache.data.should.eql({ '_root': 'I should be at the root!' });
    });
  });

  describe('engine.cache:', function () {
    it('should store data on `cache.data`:', function () {
      engine.data({ a: 'a', b: 'b', c: 'c' });
      engine.cache.data.should.have.property('a', 'a');
    });

    it('should `.get()` data from the cache:', function () {
      engine.data({ a: 'a', b: 'b', c: 'c' });
      engine.get('data').should.have.property('a', 'a');
    });

    it('should `.get()` data properties from the cache:', function () {
      engine.data({ a: { b: { c: 'd'} } });
      engine.get('data.a.b.c').should.equal('d');
    });

    it('should `.set()` data on the cache:', function () {
      engine.set('data', { a: 'a', b: 'b', c: 'c' });
      engine.get('data').should.have.property('a', 'a');
    });
  });

  describe('.namespace():', function () {
    describe('when an arbitrary string is passed as the key:', function () {
      it('should use the key to namespace data from a file:', function () {
        engine.namespace('abc', 'test/fixtures/data/x.yml');
        engine.cache.data.should.eql({abc: { x: 'x', y: 'y', z: 'z' }});
      });
    });

    describe('when a node.js `path` method is passed as the key:', function () {
      it('should use the method on the path to get the key:', function () {
        engine.namespace(':basename', 'test/fixtures/data/a.json');
        engine.namespace(':basename', 'test/fixtures/data/x.yml');
        engine.cache.data.should.have.property('a', { a: 'a', b: 'b', c: 'c' });
        engine.cache.data.should.have.property('x', { x: 'x', y: 'y', z: 'z' });
      });
    });
  });
});
