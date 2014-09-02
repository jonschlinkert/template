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


describe('default helpers:', function () {

  it('should use the `partial` helper with any engine.', function (done) {
    template.partial('a.md', '---\nname: "AAA"\n---\n<%= name %>', {name: 'BBB'});

    var file = {path: 'a.md', content: '<%= partial("a.md", {name: "CCC"}) %>'};
    template.render(file, function (err, content) {
      if (err) return done(err);
      content.should.equal('CCC');
      done();
    });
  });

  it('should use the `partial` helper with any engine.', function (done) {
    template.partial({'abc.md': {content: '---\nname: "AAA"\n---\n<%= name %>', name: 'BBB'}});

    var file = {path: 'xyz.md', content: '<%= partial("abc.md", {name: "CCC"}) %>'};
    template.render(file, {name: 'DDD'}, function (err, content) {
      if (err) return done(err);
      content.should.equal('CCC');
      done();
    });
  });
});
