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


describe('default template', function () {
  before(function () {
    template.init();

    template.parser('md', function md(file, next) {
      file = utils.extendFile(file);
      _.merge(file, matter(file.content));
      next(null, file);
    });
  });


  describe('when no file extension is provided:', function () {
    var template = new Template();

    it('should add parsers to the default stack:', function (done) {

      template
        .parser(function (file, next) {
          next(null, file);
        })
        .parser(function (file, next) {
          next(null, file);
        })
        .parser(function (file, next) {
          next(null, file);
        });


      done();
    });


    it('should use `file.path` to determine the correct consolidate engine to render content:', function (done) {
      template.engine('hbs', consolidate.handlebars);
      template.engine('jade', consolidate.jade);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      var files = [
        {path: 'fixture.hbs', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'},
        {path: 'fixture.tmpl', content: '<title><%= author %></title>', author: 'Jon Schlinkert'},
        {path: 'fixture.jade', content: 'title= author', author: 'Jon Schlinkert'},
        {path: 'fixture.swig', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'}
      ];

      files.forEach(function(file) {
        template.render(file, function (err, content) {
          if (err) console.log(err);
          content.should.equal('<title>Jon Schlinkert</title>');
        });
      });

      done();
    });
  });
});