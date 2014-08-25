/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var template = new Template();

describe('template engine', function() {
  beforeEach(function() {
    template.clear();
  });

  describe('.engine()', function() {
    it('should engine template engines to the `cache` object.', function() {
      template.engine('a', {
        render: function () {}
      });
      template.engine('b', {
        render: function () {}
      });
      template.engine('c', {
        render: function () {}
      });
      template.engine('d', {
        render: function () {}
      });

      template.cache.should.have.property('.a');
      template.cache.should.have.property('.b');
      template.cache.should.have.property('.c');
      template.cache.should.have.property('.d');
      Object.keys(template.cache).length.should.equal(4);
    });

    it('should normalize engine extensions to not have a dot.', function() {
      template.engine('.a', {
        render: function () {}
      });
      template.engine('.b', {
        render: function () {}
      });
      template.engine('.c', {
        render: function () {}
      });
      template.engine('.d', {
        render: function () {}
      });

      template.cache.should.have.property('.a');
      template.cache.should.have.property('.b');
      template.cache.should.have.property('.c');
      template.cache.should.have.property('.d');
      Object.keys(template.cache).length.should.equal(4);
    });

    it('should be chainable.', function() {
      template
        .engine('a', {
          render: function () {}
        })
        .engine('b', {
          render: function () {}
        })
        .engine('c', {
          render: function () {}
        })
        .engine('d', {
          render: function () {}
        });


      var a = template.getEngine('.a');

      assert.equal(typeof a, 'object');
      assert.equal(typeof a.render, 'function');

      template.cache.should.have.property('.a');
      template.cache.should.have.property('.b');
      template.cache.should.have.property('.c');
      template.cache.should.have.property('.d');
      Object.keys(template.cache).length.should.equal(4);
    });
  });
});
