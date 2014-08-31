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

  // it('should use the `partial` helper with any engine.', function (done) {
  //   template.partial('a', '---\nname: "AAA"\n---\n<%= name %>', {name: 'BBB'});
  //   var file = {path: 'a.md', content: '<%= partial("a", {name: "CCC"}) %>'};

  //   template.render(file, function (err, flie) {
  //     if (err) console.log(err);
  //     // console.log(flie)
  //     // /^# view-cache/.test(flie).should.be.true;
  //   });

  //   done();
  // });

  it('should use the `partial` helper with any engine.', function (done) {
    template.partial({'abc.md': {content: '---\nname: "AAA"\n---\n<%= name %>', name: 'BBB'}});

    // var file = {path: 'xyz.md', content: '<%= partial("abc.md", {name: "CCC"}) %>'};
    var file = {};
    file['xyz.md'] = '<%= partial("abc.md", {name: "CCC"}) %>';
    template.render(file, {name: 'DDD'}, function (err, file) {
      if (err) console.log(err);
      console.log(file)
      // file.should.have.property('name');
    });

    done();
  });
});
