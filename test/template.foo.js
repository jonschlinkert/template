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
  // before(function () {
  //   template.init();

  //   template._foo('md', function foo(file, next) {
  //     file = utils.extendFile(file);
  //     file = _.merge({}, matter(file.content), file);
  //     next(null, file);
  //   });
  // });


  describe.only('when a sync parser is defined:', function () {

    it('should add sync parsers to the stack for an extension:', function (done) {
      var template = new Template();

      template.engine('md', consolidate.handlebars);

      template
        .parserSync('md', function a(acc, value, key, stack) {
          if (key === 'locals') {
            value.author = 'Brian Woodward';
          }
          acc[key] = value;
          return acc;
        })
        .parserSync('md', function b(acc, value, key, stack) {
          if (key === 'locals') {
            value.author = value.author.toUpperCase();
          }
          acc[key] = value;
          return acc;
        })
        .parserSync('md', function c(acc, value, key, stack) {
          acc[key] = value;
          return acc;
        });

      var file = {path: 'fixture.md', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'};

      template.render(file, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>BRIAN WOODWARD</title>');
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