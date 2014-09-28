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
var helpers = require('test-helpers')({dir: 'test'});
var Template = require('..');
var template = new Template();


describe('template preprocess', function () {
  beforeEach(function () {
    template = new Template();
  });


  describe('when `options.preprocess` is `false`:', function () {
    it('should render the given string directly:', function (done) {
      template.option('preprocess', false);

      template.render('<%= name %> Schlinkert', {name: 'Jon'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<%= name %> Schlinkert');
        done();
      });
    });

    it('should render the given string with :', function (done) {
      template.option('preprocess', false);
      template.engine('*', require('engine-lodash'));

      template.render('<%= name %> Schlinkert', {name: 'Jon'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });
  });
});
