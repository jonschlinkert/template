/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Halle Nicole, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var should = require('should');
var Engine = require('..');
var template = new Engine();
var consolidate = require('consolidate');
var async = require('async');


describe('generated helpers:', function () {
  describe('build-in engines:', function () {
    it('should use the `partial` helper with a built-in engine.', function (done) {
      template.partial('a.md', '---\nname: "AAA"\n---\n<%= name %>', {name: 'BBB'});
      var file = {path: 'a.md', content: 'foo <%= partial("a.md") %> bar'};

      template.render(file, function (err, content) {
        if (err) console.log(err);
        content.should.equal('foo BBB bar');
        done();
      });
    });

    it('should use the `partial` helper and locals with a built-in engine.', function (done) {
      template.partial({'abc.md': {content: '---\nname: "AAA"\n---\n<%= name %>', name: 'BBB'}});
      var obj = {path: 'xyz.md', content: 'foo <%= partial("abc.md", {name: "CCC"}) %> bar'};

      template.render(obj, {name: 'DDD'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('foo CCC bar');
        done();
      });
    });
  });


  describe('user-defined engines:', function () {
    it('should use the `partial` helper with handlebars.', function (done) {
      template.engine('hbs', consolidate.handlebars);

      template.partial('title', '<title>{{name}}</title>', {name: 'BBB'});
      template.page('a.hbs', {path: 'a.hbs', content: 'foo {{{partial "title" name}}} bar', name: 'Halle Nicole'});

      template.render('a.hbs', function (err, content) {
        if (err) console.log(err);
        content.should.equal('foo <title>Halle Nicole</title> bar');
        done();
      });
    });

    // it('should use the `partial` helper with any engine.', function (done) {
    //   template.engine('hbs', consolidate.handlebars);
    //   template.engine('md', consolidate.handlebars);
    //   template.engine('swig', consolidate.swig);
    //   template.engine('tmpl', consolidate.lodash);

    //   template.partial('a.hbs', '---\nname: "AAA"\n---\n<title>{{name}}</title>', {name: 'BBB'});
    //   template.page({path: 'a.hbs', content: '<title>{{author}}</title>', author: 'Halle Nicole'});
    //   template.page({path: 'b.tmpl', content: '<title><%= author %></title>', author: 'Halle Nicole'});
    //   template.page({path: 'd.swig', content: '<title>{{author}}</title>', author: 'Halle Nicole'});
    //   template.page({'e.swig': {content: '<title>{{author}}</title>', author: 'Halle Nicole'}});
    //   template.page('f.hbs', '<title>{{author}}</title>', {author: 'Halle Nicole'});
    //   template.page('g.md', '---\nauthor: Brian Woodward\n---\n<title>{{author}}</title>', {author: 'Halle Nicole'});
    //   template.page({path: 'with-partial.hbs', content: '{{partial "a.hbs" custom.locals}}'});

    //   template.render('a.hbs', {custom: {locals: {name: 'Halle Nicole' }}}, function (err, content) {
    //     if (err) console.log(err);
    //     content.should.equal('<title>Halle Nicole</title>');
    //   });

    //   template.render('with-partial.hbs', {custom: {locals: {name: 'Halle Nicole' }}}, function (err, content) {
    //     if (err) console.log(err);
    //     content.should.equal('<title>Halle Nicole</title>');
    //   });

    //   async.each(template.cache.pages, function (file, next) {
    //     var page = template.cache.pages[file];

    //     template.render(page, {custom: {locals: {name: 'Halle Nicole' }}}, function (err, content) {
    //       if (err) return next(err);
    //       content.should.equal('<title>Halle Nicole</title>');
    //       next(null);
    //     });
    //   });

    //   done();
    // });
  });
});
