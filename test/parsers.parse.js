/*!
 * parser-cache <https://github.com/jonschlinkert/parser-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var should = require('should');
var matter = require('gray-matter');
var utils = require('parser-utils');
var _ = require('lodash');

var Template = require('..');
var template = new Template();


describe('default template', function () {
  before(function () {
    template = new Template();
  });

  describe('when a file extension is provided:', function () {
    it('should run a parser stack based on file extension:', function () {
      template
        .parserSync('a', function (file, value, key) {
          file.content = 'abc-' + file.content;
        })
        .parserSync('a', function (file, value, key) {
          file.content = file.content.toUpperCase();
        })
        .parserSync('a', function (file, value, key) {
          file.content = file.content.replace(/(.)/g, '$1 ')
        });

      template.getParsers('a').length.should.equal(3);

      var result = template.parse({ext: 'a', content: 'xyz'});
      result.should.have.property('content', 'A B C - X Y Z ');
    });
  });

  it('should parse content with the default parser.', function () {
    var matter = template.getParsers('md');

    template.parse('str', matter, function (file, value, key) {
      file.content.should.equal('str');
    });
  });
});