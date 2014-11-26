/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Template = require('..');
var pkg = require('../package');


describe('template data', function() {
  var template = new Template();
  beforeEach(function() {
    template.clear();
  });


  describe('.data()', function() {
    var template = new Template();
    it('should set properties on the `data` object.', function() {
      template.set('data.foo', 'bar');
      template.get('data').foo.should.equal('bar');
      template.get('data.foo').should.equal('bar');
    });

    it('should read files and merge data onto `cache.data`', function() {
      template.data('package.json');
      template.get('data.package.name').should.equal(pkg.name);
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

  describe('.extendData()', function() {
    var template = new Template();
    it('should extend the `data` object.', function() {
      template
        .extendData({x: 'x', y: 'y', z: 'z'})
        .extendData({a: 'a', b: 'b', c: 'c'});

      template.get('data').should.have.properties(['a', 'b', 'c', 'x', 'y', 'z']);
    });

    it('should extend the `data` object when the first param is a string.', function() {
      template
        .extendData('foo', {x: 'x', y: 'y', z: 'z'})
        .extendData('bar', {a: 'a', b: 'b', c: 'c'});

      template.get('data').should.have.properties(['foo', 'bar']);
    });

    it('should be able to lookup properties directly from the `cache.data` object.', function() {
      template
        .extendData('foo', {x: 'x', y: 'y', z: 'z'})
        .extendData('bar', {a: 'a', b: 'b', c: 'c'});

      template.cache.data.foo.should.have.property('x');
      template.cache.data.bar.should.have.property('a');
    });

    it('should be able to lookup properties using object paths.', function() {
      template
        .extendData('foo', {x: 'x', y: 'y', z: 'z'})
        .extendData('bar', {a: 'a', b: 'b', c: 'c'});

      template.get('data.foo').should.have.property('x');
      template.get('data.bar').should.have.property('a');
    });
  });

  describe('.flattenData()', function() {
    var template = new Template();
    it('should merge the value of a nested `data` property onto the root of the given object.', function() {
      var root = template.flattenData({data: {x: 'x'}, y: 'y', z: 'z'});
      root.should.have.properties(['x', 'y', 'z']);
      root.should.not.have.property('data');
    });

    it('should merge the value of a nested `data` property onto the root of the given object.', function() {
      var root = template.flattenData({a: 'b', data: {x: 'x'}, y: 'y', z: 'z'});
      root.should.have.properties(['a', 'x', 'y', 'z']);
      root.should.not.have.property('data');
    });
  });

  describe('.plasma()', function() {
    var template = new Template();
    it('should read JSON files and return an object.', function() {
      var data = template.plasma('package.json');
      data.package.name.should.equal(pkg.name);
    });

    it('should read YAML files and return an object.', function() {
      var data = template.plasma('test/fixtures/a.yml');
      data.a.should.eql({a: 'b'});
    });

    it('should read an array of YAML and JSON files and return an object.', function() {
      var data = template.plasma(['package.json', 'test/fixtures/a.yml']);
      data.package.name.should.equal(pkg.name);
      data.a.should.eql({a: 'b'});
    });

    it('should expand a glob pattern, read JSON/YAML files and return an object.', function() {
      var data = template.plasma('p*.json');
      data.package.name.should.equal(pkg.name);
    });

    it('should expand an array of glob patterns, read the JSON/YAML files and return an object.', function() {
      var data = template.plasma(['p*.json', 'test/fixtures/*.yml']);
      data.package.name.should.equal(pkg.name);
      data.a.should.eql({a: 'b'});
    });

    it('should accept an object and return an object.', function() {
      var data = template.plasma({a: 'b'})
      data.should.have.property('a', 'b');
    });
  });

});
