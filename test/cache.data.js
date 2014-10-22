/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Engine = require('..');
var pkg = require('../package');


describe('engine data', function() {
  var template = new Engine();
  beforeEach(function() {
    template.clear();
  });

  describe('.extendData()', function() {
    var template = new Engine();
    it('should extend the `data` object.', function() {
      template
        .extendData({x: 'x', y: 'y', z: 'z'})
        .extendData({a: 'a', b: 'b', c: 'c'});

      template.get('data').should.have.property('a');
      template.get('data').should.have.property('b');
      template.get('data').should.have.property('c');

      template.get('data').should.have.property('x');
      template.get('data').should.have.property('y');
      template.get('data').should.have.property('z');
    });

    it('should extend the `data` object when the first param is a string.', function() {
      template
        .extendData('foo', {x: 'x', y: 'y', z: 'z'})
        .extendData('bar', {a: 'a', b: 'b', c: 'c'});

      template.get('data').should.have.property('foo');
      template.get('data').should.have.property('bar');

      template.get('data.foo').should.have.property('x');
      template.get('data.bar').should.have.property('a');

      template.cache.data.foo.should.have.property('x');
      template.cache.data.bar.should.have.property('a');
    });
  });

  describe('.flattenData()', function() {
    var template = new Engine();
    it('should merge the value of a nested `data` property onto the root of the given object.', function() {
      var root = template.flattenData({data: {x: 'x'}, y: 'y', z: 'z'});
      root.should.have.property('x');
      root.should.have.property('y');
      root.should.have.property('z');
      root.should.not.have.property('data');
    });

    it('should merge the value of a nested `data` property onto the root of the given object.', function() {
      var root = template.flattenData({a: 'b', data: {x: 'x'}, y: 'y', z: 'z'});
      root.should.have.property('a');
      root.should.have.property('x');
      root.should.have.property('y');
      root.should.have.property('z');
      root.should.not.have.property('data');
    });
  });

  describe('.plasma()', function() {
    var template = new Engine();
    it('should read JSON files and return an object.', function() {
      var data = template.plasma('package.json');
      data.name.should.equal(pkg.name);
    });

    it('should read YAML files and return an object.', function() {
      var data = template.plasma('test/fixtures/a.yml');
      data.a.should.equal('b');
    });

    it('should read an array of YAML and JSON files and return an object.', function() {
      var data = template.plasma(['package.json', 'test/fixtures/a.yml']);
      data.name.should.equal(pkg.name);
      data.a.should.equal('b');
    });

    it('should expand a glob pattern, read JSON/YAML files and return an object.', function() {
      var data = template.plasma('p*.json');
      data.name.should.equal(pkg.name);
    });

    it('should expand an array of glob patterns, read the JSON/YAML files and return an object.', function() {
      var data = template.plasma(['p*.json', 'test/fixtures/*.yml']);
      data.name.should.equal(pkg.name);
      data.a.should.equal('b');
    });

    it('should accept an object and return an object.', function() {
      var data = template.plasma({a: 'b'})
      data.should.have.property('a', 'b');
    });
  });

  describe('.data()', function() {
    var template = new Engine();
    it('should set properties on the `data` object.', function() {
      template.set('data.foo', 'bar');
      template.get('data').foo.should.equal('bar');
      template.get('data.foo').should.equal('bar');
    });

    it('should read files and merge data onto `cache.data`', function() {
      template.data('package.json');
      template.get('data.name').should.equal(pkg.name);
    });

    it('should read files and merge data onto `cache.data`', function() {
      template.data({xyz: 'abc'});
      template.get('data.xyz').should.equal('abc');
    });

    it('should read files and merge data onto `cache.data`', function() {
      template.data([{aaa: 'bbb', ccc: 'ddd'}]);
      template.get('data.aaa').should.equal('bbb');
      template.get('data.ccc').should.equal('ddd');
    });
  });
});
