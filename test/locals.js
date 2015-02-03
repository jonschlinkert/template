/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var Template = require('..');
var template = new Template();

describe('template locals', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('context:', function () {
    it('should pass data to templates from locals:', function (done) {
      template.page('aaa.md', 'foo <%= abc %> bar', { abc: 'xyz'});

      template.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('foo xyz bar');
        done();
      });
    });


    it('should use custom delimiters defined on the global options:', function (done) {
      template.engine('*', require('engine-lodash'));
      template.option('layoutDelims', ['{{', '}}'])

      template.layout('default', 'abc{{ body }}xyz');
      template.page('foo', {content: '<%= name %>', name: 'Jon Schlinkert', layout: 'default'});

      template.render('foo', function (err, content) {
        if (err) return done(err);
        // content.should.equal('abcJon Schlinkertxyz');
        done();
      });
    });

    it('should use custom delimiters defined on a template\'s locals:', function (done) {
      template.engine('*', require('engine-lodash'));

      template.layout('default', 'abc{{ body }}xyz');
      template.page('foo', {content: '<%= name %>', name: 'Jon Schlinkert', layout: 'default', layoutDelims: ['{{', '}}']});

      template.render('foo', function (err, content) {
        if (err) return done(err);
        // content.should.equal('abcJon Schlinkertxyz');
        done();
      });
    });

    it('should use custom delimiters defined on a template\'s options:', function (done) {
      template.engine('*', require('engine-lodash'));

      template.layout('default', 'abc{{ body }}xyz');
      template.page('foo', {content: '<%= name %>', name: 'Jon Schlinkert', layout: 'default'}, {layoutDelims: ['{{', '}}']});

      template.render('foo', function (err, content) {
        if (err) return done(err);
        // content.should.equal('abcJon Schlinkertxyz');
        done();
      });
    });

    it('should use custom delimiters defined on `.render()` locals:', function (done) {
      template.engine('*', require('engine-lodash'));

      template.layout('default', 'abc{{ body }}xyz');
      template.page('foo', {content: '<%= name %>', name: 'Jon Schlinkert', layout: 'default'});

      template.render('foo', {layoutDelims: ['{{', '}}']}, function (err, content) {
        if (err) return done(err);
        // content.should.equal('abcJon Schlinkertxyz');
        done();
      });
    });
  });
});
