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
var template = new Engine();

describe('template data', function () {
  beforeEach(function (done) {
    template = new Engine();
    done();
  });

  describe('.data():', function () {
    it('should load data from an object:', function () {
      template.data({ a: 'a', b: 'b', c: 'c' });
      template.cache.should.have.property('data', { a: 'a', b: 'b', c: 'c' });
    });

    it('should load data from a JSON file:', function () {
      template.data('test/fixtures/data/a.json');
      template.cache.should.have.property('data', { a: 'a', b: 'b', c: 'c' });
    });

    it('should load data from a YAML file:', function () {
      template.data('test/fixtures/data/x.yml');
      template.cache.should.have.property('data', { x: 'x', y: 'y', z: 'z' });
    });

    it('should load data from a glob pattern:', function () {
      template.data('test/fixtures/data/{a,x}.*');
      template.cache.should.have.property('data', { a: 'a', b: 'b', c: 'c', x: 'x', y: 'y', z: 'z' });
    });

    it('should merge data from `data` into the root of the context:', function () {
      template.data('test/fixtures/data/data.json');
      template.cache.should.have.property('data', { '_root': 'I should be at the root!' });
    });
  });

  describe('template.cache:', function () {
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

  describe('.namespace():', function () {
    describe('when an arbitrary string is passed as the key:', function () {
      it('should use the key to namespace data from a file:', function () {
        template.namespace('abc', 'test/fixtures/data/x.yml');
        template.cache.should.have.property('data', {abc: { x: 'x', y: 'y', z: 'z' }});
      });
    });

    describe('when a node.js `path` method is passed as the key:', function () {
      it('should use the method on the path to get the key:', function () {
        template.namespace(':basename', 'test/fixtures/data/a.json');
        template.namespace(':basename', 'test/fixtures/data/x.yml');
        template.cache.data.should.have.property('a', { a: 'a', b: 'b', c: 'c' });
        template.cache.data.should.have.property('x', { x: 'x', y: 'y', z: 'z' });
      });
    });
  });

  describe('context:', function () {
    it('should pass data to templates in the `.render()` method:', function (done) {
      template.data({ abc: 'xyz'});
      template.page('aaa.md', '<%= abc %>');

      template.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('xyz');
        done();
      });
    });

    it('should pass data to templates in the `.renderSync()` method:', function () {
      template.data({ letter: 'b'});
      template.page('aaa.md', 'a<%= letter %>c');

      template.renderSync('aaa.md').should.equal('abc');
    });

    it('should give preference to locals over "global" data:', function () {
      template.data({ letter: 'b'});

      template.page('aaa.md', 'a<%= letter %>c', { letter: 'bbb'});
      template.renderSync('aaa.md').should.equal('abbbc');
    });

    it('should give preference to front matter over locals:', function () {
      template.data({ letter: 'b'});

      template.page('aaa.md', '---\nletter: zzz\n---\na<%= letter %>c', { letter: 'bbb'});
      template.renderSync('aaa.md').should.equal('azzzc');
    });

    describe('when `options.preferLocals` is defined:', function () {
      it('should give preference to locals over front matter:', function () {
        template.option('preferLocals', true);
        template.data({ letter: 'b'});

        template.page('aaa.md', '---\nletter: zzz\n---\na<%= letter %>c', { letter: 'bbb'});
        template.renderSync('aaa.md').should.equal('abbbc');
      });
    });
  });
});
