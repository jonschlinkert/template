/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var Template = require('..');
var template = new Template();
var consolidate = require('consolidate');


describe('template render:', function () {
  it('should determine the engine from the `path` on the given object:', function (done) {
    var file = {path: 'a/b/c.md', content: '<%= name %>', name: 'Jon Schlinkert'};

    template.render(file, function (err, content) {
      if (err) console.log(err);
      content.should.equal('Jon Schlinkert');
      done();
    });
  });

  it('should determine the engine from the `path` on the given object:', function (done) {
    var file = {path: 'a/b/c.md', content: '<%= name %>'};

    template.render(file, {name: 'Jon Schlinkert'}, function (err, content) {
      if (err) console.log(err);
      content.should.equal('Jon Schlinkert');
      done();
    });
  });

  it('should render content with an engine from [consolidate].', function (done) {
    template.engine('hbs', consolidate.handlebars);
    var hbs = template.getEngine('hbs');

    hbs.render('{{name}}', {name: 'Jon Schlinkert'}, function (err, content) {
      if (err) console.log(err);
      content.should.equal('Jon Schlinkert');
      done();
    });
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
