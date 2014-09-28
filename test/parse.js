/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var should = require('should');
var consolidate = require('consolidate');
var Template = require('..');
var template = new Template();
var matter = require('gray-matter');
var utils = require('parser-utils');
var _ = require('lodash');


describe('template parser', function() {
  beforeEach(function() {
    template = new Template();
  });

  describe('.parser()', function() {
    template.parser('md', function md (file) {
      file = _.merge(utils.extendFile(file), matter(file.content));
    });
  });

  describe('when parsers are defined:', function () {
    it('should add sync parsers to the stack for an extension:', function () {
      template
        .parserSync('abc', function() {})
        .parserSync('abc', function() {})
        .parserSync('abc', function() {})

      template.getParsers('abc').length.should.equal(3);
    });
  });

  describe('when the `.render()` method is called:', function () {

    it('should run the parser stack for the given template before passing it to render:', function () {
      template.engine('md', consolidate.handlebars);

      template
        .parserSync('md', function a(file, value, key) {
          file.locals.author = 'Brian Woodward';
        })
        .parserSync('md', function b(file, value, key) {
          file.locals.author = file.locals.author.toUpperCase();
        })

      var file = {path: 'fixture.md', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'};

      template.render(file, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>BRIAN WOODWARD</title>');
      });
    });
  });
});
