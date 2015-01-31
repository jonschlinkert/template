/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template = new Template();


describe('template.option()', function() {
  describe('.option()', function() {
    beforeEach(function () {
      template = new Template();
    })

    it('should set an option.', function() {
      template.option('a', 'b');
      template.options.should.have.property('a');
    });

    it('should get an option.', function() {
      template.option('a', 'b');
      template.option('a').should.equal('b');
    });

    it('should extend the `options` object.', function() {
      template.option({x: 'xxx', y: 'yyy', z: 'zzz'});
      template.option('x').should.equal('xxx');
      template.option('y').should.equal('yyy');
      template.option('z').should.equal('zzz');
    });

    it('options should be on the `options` object.', function() {
      template.option({x: 'xxx', y: 'yyy', z: 'zzz'});
      template.options.x.should.equal('xxx');
      template.options.y.should.equal('yyy');
      template.options.z.should.equal('zzz');
    });

    it('should be chainable.', function() {
      template
        .option({x: 'xxx', y: 'yyy', z: 'zzz'})
        .option({a: 'aaa', b: 'bbb', c: 'ccc'});

      template.option('x').should.equal('xxx');
      template.option('a').should.equal('aaa');
    });

    it('should extend the `options` object when the first param is a string.', function() {
      template
        .option('foo', {x: 'xxx', y: 'yyy', z: 'zzz'})
        .option('bar', {a: 'aaa', b: 'bbb', c: 'ccc'});

      template.option('foo').should.have.property('x');
      template.option('bar').should.have.property('a');

      template.options.foo.should.have.property('x');
      template.options.bar.should.have.property('a');
    });

  });
});
