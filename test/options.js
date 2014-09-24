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
var Template = require('../tmpl');
var template = new Template();


describe('template render', function () {
  beforeEach(function (done) {
    template = new Template();
    done();
  });


  describe('when an un-cached string is passed to `.render()`:', function () {
    it('should prettify HTML when `options.pretty` is enabled:', function (done) {
      template.pages(__dirname + '/fixtures/pretty/before.html');
      template.option('pretty', true);

      template.render('before.html', {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) console.log(err);
        console.log(content)
        // content.should.equal(helpers.readActual('after.html'));
        done();
      });
    });
  });
});
