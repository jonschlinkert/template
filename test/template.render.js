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

describe('template render:', function () {
  it('should determine the engine from the `path` on the given object:', function (done) {
    var file = {name: 'Jon Schlinkert', path: 'a/b/c.md', content: '<%= name %>'};

    template.render(file, {}, function (err, content) {
      if (err) console.log(err);
      content.should.equal('Jon Schlinkert');
      done();
    });
  });
});
