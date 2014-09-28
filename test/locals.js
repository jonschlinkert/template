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

describe('template locals', function () {
  beforeEach(function (done) {
    template = new Template();
    done();
  });

  describe('context:', function () {
    it('should pass data to templates from locals:', function (done) {
      template.page('aaa.md', '<%= abc %>', { abc: 'xyz'});

      template.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('xyz');
        done();
      });
    });
  });
});
