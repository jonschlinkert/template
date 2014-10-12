/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Template = require('..');
var template = new Template();
var matter = require('gray-matter');
var utils = require('parser-utils');
var _ = require('lodash');


describe('default parsers', function () {
  before(function () {
    template = new Template();
  });

  describe('file extension:', function () {
    describe('when no file extension is provided:', function () {
      it('should add un-named parsers to the default stack:', function () {
        template
          .parserSync(function a(file, value, key) {
            file.a = file.a || 'a';
          })
          .parserSync(function b(file, value, key) {
            file.a += 'b';
          })
          .parserSync(function c(file, value, key) {
            file.a += 'c';
          });

        template.getParsers('*', true).length.should.equal(4);

        var result = template.parseSync({a: ''});
        result.should.have.property('a', 'abc');
      });
    });
  });


  describe('when the noop parser is used on a string:', function() {
    it('should return it on the `content` property.', function () {
      var noop = template.getParsers('*', true);
      template.parse('<%= name %>', noop).should.have.property('content', '<%= name %>');
    });
  });

  it('should run a parser stack passed as a second param:', function () {
    var template = new Template();

    var res = template.parse('abc', function (file, value, key, i) {
      if (i === 0) file.content += '-xyz';
    });

    res.should.have.property('content', 'abc-xyz');
  });

  it.skip('should parse content with the given parser.', function () {
    var fixture = '---\ntitle: Front Matter\n---\nThis is content.';
    var matter = template.getParsers('md');

    template.parse(fixture, matter, function (file, value, key) {
      file.should.be.an.object;
      file.should.have.property('path');
      file.should.have.property('data');
      file.should.have.property('content');
      file.should.have.property('orig');
      file.data.should.eql({title: 'Front Matter'});
      file.content.should.eql('This is content.');
    });
  });

  it('should parse content with the default parser.', function () {
    var matter = template.getParsers('md');
    template.parse('str', matter, function (file, value) {
      file.content.should.eql('str');
    });
  });

  it('should retain the original `orig.content` value.', function (done) {

    var file = {
      path: 'a/b/c.md',
      content: 'Hooray!',
      blah: 'bbb',
      data: {
        title: 'FLFLFLF'
      }
    };

    var a = utils.extendFile(file, {title: 'ABC'});

    template.parse(a, function (file) {
      file.orig.content.should.eql('Hooray!');
    });

    a.orig.content = 'fosososoos';
    a.foo = 'fosososoos';

    template.parse(a, function (file) {
      file.foo.should.eql('fosososoos');
      file.orig.content.should.eql('Hooray!');
    });

    done();
  });
});