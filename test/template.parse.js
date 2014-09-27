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


describe('template parse', function () {
  before(function () {
    template.init();

    template.parser('md', function mdSync(file, next) {
      file = utils.extendFile(file);
      _.merge(file, matter(file.content));
      next(null, file);
    });
  });


  describe('when a sync parser is defined:', function () {
    var template = new Template();

    it.only('should add sync parsers to the stack for an extension:', function (done) {
      template.engine('md', consolidate.handlebars);
      // template
      //   .parser('md', function oneSync(file, next) {
      //     console.log(file)
      //     next(null, file);
      //   })
      //   .parser('md', function twoSync(file, next) {
      //     next(null, file);
      //   })
      //   .parser('md', function threeSync(file, next) {
      //     next(null, file);
      //   });

      var file = {path: 'fixture.md', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'};

      template.render(file, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Jon Schlinkert</title>');
      });

      done();
    });

    it('should add sync parsers without an extension to the default stack:', function (done) {
      template.engine('md', consolidate.handlebars);
      template
        .parser(function (file, next) {
          console.log(file)
          next(null, file);
        })
        .parser(function (file, next) {
          next(null, file);
        })
        .parser(function (file, next) {
          next(null, file);
        });

      var file = {path: 'fixture.md', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'};

      template.render(file, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Jon Schlinkert</title>');
      });

      done();
    });


    // it('should use `file.path` to determine the correct consolidate engine to render content:', function (done) {
    //   template.engine('hbs', consolidate.handlebars);
    //   template.engine('jade', consolidate.jade);
    //   template.engine('swig', consolidate.swig);
    //   template.engine('tmpl', consolidate.lodash);

    //   var files = [
    //     {path: 'fixture.hbs', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'},
    //     {path: 'fixture.tmpl', content: '<title><%= author %></title>', author: 'Jon Schlinkert'},
    //     {path: 'fixture.jade', content: 'title= author', author: 'Jon Schlinkert'},
    //     {path: 'fixture.swig', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'}
    //   ];

    //   files.forEach(function(file) {
    //     template.render(file, function (err, content) {
    //       if (err) console.log(err);
    //       content.should.equal('<title>Jon Schlinkert</title>');
    //     });
    //   });

    //   done();
    // });
  });
});