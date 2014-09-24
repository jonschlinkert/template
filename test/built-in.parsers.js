/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Template = require('../tmpl');
var template = new Template();
var matter = require('gray-matter');
var utils = require('parser-utils');
var _ = require('lodash');


describe('default parsers', function () {
  before(function () {
    template.init();

    template.parser('md', function md (file, next) {
      file = utils.extendFile(file);
      _.merge(file, matter(file.content));
      next(null, file);
    });
  });


  describe('.parse()', function() {
    it('should normalize content with noop parser.', function (done) {
      var noop = template.getParsers('*');

      template.parse('<%= name %>', noop, function (err, file) {
        if (err) {
          console.log(err);
        }
        file.content.should.equal('<%= name %>');
        done();
      });
    });
  });

  describe('when no file extension is provided:', function () {
    var template = new Template();

    it('should add parsers to the default stack:', function (done) {

      template
        .parser(function (file, next) {
          file.a = file.a || 'a';
          next(null, file);
        })
        .parser(function (file, next) {
          file.a = file.a + 'b';
          next(null, file);
        })
        .parser(function (file, next) {
          file.a = file.a + 'c';
          next(null, file);
        });

      template.getParsers('*').length.should.equal(4);

      template.parse({a: ''}, function (err, file) {
        file.a.should.equal('abc');
      });
      done();
    });
  });

  it('should parse content with the default parser.', function (done) {
    template.parse('str', function (err, file) {
      if (err) {
        console.log(err);
      }

      file.should.be.an.object;
      file.should.have.property('path');
      file.should.have.property('data');
      file.should.have.property('content');
      file.should.have.property('orig');
    });

    done();
  });

  it('should run a parser stack passed as a second param:', function () {
    var template = new Template();

    template
      .parser('a', function (file, next) {
        file.content = 'abc-' + file.content;
        next(null, file);
      })
      .parser('a', function (file, next) {
        file.content = file.content.toUpperCase();
        next(null, file);
      })
      .parser('a', function (file, next) {
        file.content = file.content.replace(/(.)/g, '$1 ')
        next(null, file);
      });

    var stack = template.getParsers('a');

    template.parse({content: 'xyz'}, stack, function (err, file) {
      file.content.should.equal('A B C - X Y Z ');
    });
  });

  it('should run a parser stack based on file extension:', function () {
    var template = new Template();

    template
      .parser('a', function (file, next) {
        file.content = 'abc-' + file.content;
        next(null, file);
      })
      .parser('a', function (file, next) {
        file.content = file.content.toUpperCase();
        next(null, file);
      })
      .parser('a', function (file, next) {
        file.content = file.content.replace(/(.)/g, '$1 ')
        next(null, file);
      });

    template.parse({ext: 'a', content: 'xyz'}, function (err, file) {
      file.content.should.equal('A B C - X Y Z ');
    });
  });

  it('should parse content with the given parser.', function (done) {
    var matter = template.getParsers('md');

    var fixture = '---\ntitle: Front Matter\n---\nThis is content.';
    template.parse(fixture, matter, function (err, file) {
      if (err) {
        console.log(err);
      }

      file.should.be.an.object;
      file.should.have.property('path');
      file.should.have.property('data');
      file.should.have.property('content');
      file.should.have.property('orig');

      file.data.should.eql({title: 'Front Matter'});
      file.content.should.eql('This is content.');
    });

    done();
  });

  it('should parse content with the default parser.', function (done) {
    var matter = template.getParsers('md');

    template.parse('str', matter, function (err, file) {
      if (err) {console.log(err); }
      file.content.should.eql('str');
    });
    done();
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
    template.parse(a, function (err, file) {
      if (err)  console.log(err);
      file.orig.content.should.eql('Hooray!');
    });

    a.orig.content = 'fosososoos';

    template.parse(a, function (err, file) {
      if (err)  console.log(err);
      file.orig.content.should.eql('Hooray!');
    });

    done();
  });

});