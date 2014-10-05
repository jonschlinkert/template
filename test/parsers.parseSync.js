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
var consolidate = require('consolidate');
var _ = require('lodash');

var Template = require('..');
var template = new Template();


describe('.parse()', function () {
  before(function () {
    template = new Template();

    template.parser('md', function (file) {
      _.merge(file, utils.extendFile(file));
      _.merge(file, matter(file.content));
    });
  });

  describe('.parseSync()', function () {
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

    describe('.parse()', function () {
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
    });
  });
});