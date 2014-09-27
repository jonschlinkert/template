/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var template = new Template();
var matter = require('gray-matter');
var utils = require('parser-utils');
var _ = require('lodash');

describe('template parser', function() {
  beforeEach(function() {
    template.clear();
  });

  describe('.parser()', function() {
    it('should add a parser to the `parsers` object.', function() {
      template.parser('a', function () {});
      template.parser('b', function () {});
      template.parser('c', function () {});
      template.parser('d', function () {});

      template.parsers.should.have.property('.a');
      template.parsers.should.have.property('.b');
      template.parsers.should.have.property('.c');
      template.parsers.should.have.property('.d');
      var len = Object.keys(template.parsers).length;
      assert.equal(len >= 6, true);
    });

    it('should normalize parser extensions to not have a dot.', function() {
      template.parser('.a', function () {});
      template.parser('.b', function () {});
      template.parser('.c', function () {});
      template.parser('.d', function () {});

      template.parsers.should.have.property('.a');
      template.parsers.should.have.property('.b');
      template.parsers.should.have.property('.c');
      template.parsers.should.have.property('.d');

      var len = Object.keys(template.parsers).length;
      assert.equal(len >= 6, true);
    });

    it('should be chainable.', function() {
      template
        .parser('a', function () {})
        .parser('b', function () {})
        .parser('c', function () {})
        .parser('d', function () {});

      template.getParsers('.a').should.be.an.array;

      template.parsers.should.have.property('.a');
      template.parsers.should.have.property('.b');
      template.parsers.should.have.property('.c');
      template.parsers.should.have.property('.d');

      var len = Object.keys(template.parsers).length;
      assert.equal(len >= 6, true);
    });
  });

});
