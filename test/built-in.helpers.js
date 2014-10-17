/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var should = require('should');
var Template = require('..');
var template = new Template();
var consolidate = require('consolidate');
var async = require('async');


describe.skip('default helpers:', function () {
  it('should use the `partial` helper with any engine.', function (done) {
    template.partial('a.md', '---\nname: "AAA"\n---\n<%= name %>', {name: 'BBB'});
    var file = {path: 'a.md', content: '<%= partial("a.md", {name: "CCC"}) %>'};


    template.render(file, function (err, content) {
      if (err) console.log(err);
      content.should.equal('CCC');
      done();
    });
  });

  it('should use the `partial` helper and locals with any engine.', function (done) {
    template.partial({'abc.md': {content: '---\nname: "AAA"\n---\n<%= name %>', name: 'BBB'}});

    var file = {path: 'xyz.md', content: '<%= partial("abc.md", {name: "CCC"}) %>'};
    template.render(file, {name: 'DDD'}, function (err, content) {

      if (err) console.log(err);
      content.should.equal('CCC');
      done();
    });
  });

  it.skip('should use the `partial` helper with any engine.', function (done) {
    // template.parser('hbs', require('parser-front-matter'));

    template.engine('hbs', consolidate.handlebars);
    template.engine('md', consolidate.handlebars);
    // template.engine('jade', consolidate.jade);
    template.engine('swig', consolidate.swig);
    template.engine('tmpl', consolidate.lodash);

    template.partial('a.hbs', '---\nname: "AAA"\n---\n<title>{{name}}</title>', {name: 'BBB'});

    template.page({path: 'a.hbs', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});
    template.page({path: 'b.tmpl', content: '<title><%= author %></title>', author: 'Jon Schlinkert'});
    // template.page({path: 'c.jade', content: 'title= author', author: 'Jon Schlinkert'});
    template.page({path: 'd.swig', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});
    template.page({'e.swig': {content: '<title>{{author}}</title>', author: 'Jon Schlinkert'}});
    template.page('f.hbs', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});
    template.page('g.md', '---\nauthor: Brian Woodward\n---\n<title>{{author}}</title>', {author: 'Jon Schlinkert'});
    template.page({path: 'with-partial.hbs', content: '{{partial "a.hbs" custom.locals}}'});


    template.render('a.hbs', {custom: {locals: {name: 'Jon Schlinkert' }}}, function (err, content) {
      if (err) console.log(err);
      content.should.equal('<title>Jon Schlinkert</title>');
    });

    template.render('with-partial.hbs', {custom: {locals: {name: 'Jon Schlinkert' }}}, function (err, content) {
      if (err) console.log(err);
      content.should.equal('<title>Jon Schlinkert</title>');
    });

    async.each(template.cache.pages, function (file, next) {
      var page = template.cache.pages[file];

      template.render(page, {custom: {locals: {name: 'Jon Schlinkert' }}}, function (err, content) {
        if (err) return next(err);
        content.should.equal('<title>Jon Schlinkert</title>');
        next(null);
      });
    }, done);
    done();
  });
});
