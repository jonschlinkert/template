/*!
 * parser-parsers <https://github.com/jonschlinkert/parser-parsers>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Parsers = require('..');
var template = new Parsers();


describe('template parser', function() {
  beforeEach(function() {
    template.clear();
  });

  describe('.parser()', function() {
    it('should add a parser to the `parsers.parsers` object.', function() {
      template.parser('a', {
        parse: function () {}
      });
      template.parser('b', {
        parse: function () {}
      });
      template.parser('c', {
        parse: function () {}
      });
      template.parser('d', {
        parse: function () {}
      });

      template.parsers.should.have.property('.a');
      template.parsers.should.have.property('.b');
      template.parsers.should.have.property('.c');
      template.parsers.should.have.property('.d');
      Object.keys(template.parsers).length.should.equal(6);
    });

    it('should normalize parser extensions to not have a dot.', function() {
      template.parser('.a', {
        parse: function () {}
      });
      template.parser('.b', {
        parse: function () {}
      });
      template.parser('.c', {
        parse: function () {}
      });
      template.parser('.d', {
        parse: function () {}
      });

      template.parsers.should.have.property('.a');
      template.parsers.should.have.property('.b');
      template.parsers.should.have.property('.c');
      template.parsers.should.have.property('.d');
      Object.keys(template.parsers).length.should.equal(6);
    });

    it('should be chainable.', function() {
      template
        .parser('a', {
          parse: function () {}
        })
        .parser('b', {
          parse: function () {}
        })
        .parser('c', {
          parse: function () {}
        })
        .parser('d', {
          parse: function () {}
        });


      var a = template.getParser('.a');

      assert.equal(typeof a, 'object');
      assert.equal(typeof a.parse, 'function');

      // console.log(template)

      template.parsers.should.have.property('.a');
      template.parsers.should.have.property('.b');
      template.parsers.should.have.property('.c');
      template.parsers.should.have.property('.d');
      Object.keys(template.parsers).length.should.equal(6);
    });
  });
});


describe('parsers', function() {
  it('should pass through content with noop parser.', function (done) {
    var noop = template.getParser('*');

    noop.parse('<%= name %>', function (err, file) {
      if (err) console.log(err);

      file.should.eql({
        data: {},
        original: '<%= name %>',
        content: '<%= name %>',
        options: {}
      });
      done();
    });
  });

  it('should synchronously pass through content.', function () {
    var noop = template.getParser('*');

    noop.parseSync('<%= abc %>').should.eql({
      data: {},
      original: '<%= abc %>',
      content: '<%= abc %>',
      options: {}
    });
  });
});


describe('parsers', function() {
  var parser = template.getParser('md');

  describe('.parseSync()', function() {
    it('should parse a string.', function() {
      var o = parser.parseSync('abc');
      o.should.have.property('data');
      o.should.have.property('content');
      o.content.should.equal('abc');
    });

    it('should parse the content property on an object.', function() {
      var o = parser.parseSync({content: 'abc'});
      o.should.have.property('data');
      o.should.have.property('content');
      o.content.should.equal('abc');
    });
  });

  describe('.parse()', function() {
    it('should parse a string.', function(done) {
      parser.parse('abc', function (err, file) {
        if (err) {
          console.log(err);
        }

        file.should.have.property('data');
        file.should.have.property('content');
        file.content.should.equal('abc');
        done();
      });
    });

    it('should parse the content property on an object.', function(done) {
      parser.parse({content: 'abc'}, function (err, file) {
        if (err) {
          done(err);
        }

        file.should.have.property('data');
        file.should.have.property('content');
        file.content.should.equal('abc');
        done();
      });
    });
  });

  describe('.parseFilesSync()', function() {
    it('should parse a glob of files synchronously.', function() {
      var files = parser.parseFilesSync('test/fixtures/parsers/*.md');

      files.length.should.equal(3);
      files[0].should.be.an.object;
      files[0].should.have.property('data');
      files[0].should.have.property('content');

      files[0].data.title.should.equal('Alpha');
      files[1].data.title.should.equal('Beta');
      files[2].data.title.should.equal('Gamma');
    });
  });

  describe('.parseFile()', function() {
    it('should parse a file.', function(done) {
      parser.parseFile('test/fixtures/parsers/a.md', function (err, file) {
        if (err) {
          done(err);
        }

        file.should.have.property('data');
        file.should.have.property('content');
        file.content.should.equal('\nThis is markdown file `a.md`.');
        file.data.should.eql({title: 'Alpha'});
        done();
      });
    });
  });

  describe('.parseFiles()', function() {
    it('should parse a glob of files.', function(done) {
      parser.parseFiles('test/fixtures/parsers/*.md', function (err, files) {
        if (err) {
          done(err);
        }
        files.length.should.equal(3);
        files[0].should.be.an.object;
        files[0].should.have.property('data');
        files[0].should.have.property('content');

        files[0].data.title.should.equal('Alpha');
        files[1].data.title.should.equal('Beta');
        files[2].data.title.should.equal('Gamma');
        done();
      });
    });
  });
});
