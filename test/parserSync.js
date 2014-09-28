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
    template = new Template();
  });

  describe('.parserSync()', function() {
    it('should stack parsers for the given ext.', function() {
      template.parserSync('a', function () {});
      template.parserSync('a', function () {});
      template.parserSync('a', function () {});

      template.getParsers('a').should.be.an.array;
      template.getParsers('a').length.should.equal(3);
    });

    it('should add a parser to the `parsers` object.', function() {
      template.parserSync('a', function () {});
      template.parserSync('b', function () {});
      template.parserSync('c', function () {});
      template.parserSync('d', function () {});

      template.parsers.should.have.property('.a');
      template.parsers.should.have.property('.b');
      template.parsers.should.have.property('.c');
      template.parsers.should.have.property('.d');
    });

    it('should normalize parser extensions to not have a dot.', function() {
      template.parserSync('.a', function () {});
      template.parserSync('.b', function () {});
      template.parserSync('.c', function () {});
      template.parserSync('.d', function () {});

      template.parsers.should.have.property('.a');
      template.parsers.should.have.property('.b');
      template.parsers.should.have.property('.c');
      template.parsers.should.have.property('.d');
    });

    it('should be chainable.', function() {
      template
        .parserSync('a', function () {})
        .parserSync('b', function () {})
        .parserSync('c', function () {})
        .parserSync('d', function () {});

      template.parsers.should.have.property('.a');
      template.parsers.should.have.property('.b');
      template.parsers.should.have.property('.c');
      template.parsers.should.have.property('.d');
    });
  });
});
