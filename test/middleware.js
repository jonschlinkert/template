/*!
 * template <https://github.com/jonschlinkert/template>
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


describe('middleware', function () {
  describe('when an un-cached string is passed to `.render()`:', function () {
    it('should prettify HTML when `options.pretty` is enabled:', function (done) {
      template.pages(__dirname + '/fixtures/prettify/before.html');

      template.route(/\.html/).all(function (file, next) {
        // console.log(file)
      });

      template.handle(template.getPage('before.html'), function (err) {
        if (err) return done(err);
      });

      template.render('before.html', {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Jon Schlinkert</title></head><body> This is content. </body></html>');
        done();
      });
    });
  });
});
