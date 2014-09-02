/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template = new Template();
var _ = require('lodash');


describe('.addHelperAsync():', function () {
  beforeEach(function () {
    template.init();
  });


  it('should register _bound_ template async helper functions by default:', function (done) {
    var helpers = template.helpers('md');

    helpers.addHelperAsync('a', function (str, callback) {
      callback(null, str.toLowerCase());
    });

    helpers.addHelperAsync('b', function (str, callback) {
      callback(null, str.toUpperCase());
    });

    helpers.should.have.property('a');
    helpers.should.have.property('b');
    helpers._.helpersAsync.should.have.property('a');
    helpers._.helpersAsync.should.have.property('b');

    template.page('foo.md', {content: 'A: <%= a(name) %>\nB: <%= b(name) %>'});

    // var lodash = template.getEngine('md');
    var ctx = {name: 'Jon Schlinkert'};

    template.render('foo.md', ctx, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: jon schlinkert\nB: JON SCHLINKERT');
      done();
    });

  });

  it('should register _un-bound_ template async helpers when `bindHelpers` is false:', function (done) {
    template.option('bindHelpers', false);
    var helpers = template.helpers('md');

    helpers
      .addHelperAsync('a', function (str, callback) {
        callback(null, str.toLowerCase());
      })
      .addHelperAsync('b', function (str, callback) {
        callback(null, str.toUpperCase());
      });

    helpers.should.have.property('a');
    helpers.should.have.property('b');
    helpers._.helpersAsync.should.have.property('a');
    helpers._.helpersAsync.should.have.property('b');

    template.page('foo.md', {content: 'A: <%= a(name) %>\nB: <%= b(name) %>'});

    // var lodash = template.getEngine('md');
    var ctx = {name: 'Jon Schlinkert'};

    template.render('foo.md', ctx, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: jon schlinkert\nB: JON SCHLINKERT');
      done();
    });
  });

  it('should use helpers registered for all engines:', function (done) {
    template
      .addHelperAsync('a', function (str, callback) {
        callback(null, str.toLowerCase());
      })
      .addHelperAsync('b', function (str, callback) {
        callback(null, str.toUpperCase());
      });

    template._.helpers.should.have.property('a');
    template._.helpers.should.have.property('b');
    template._.helpers._.helpersAsync.should.have.property('a');
    template._.helpers._.helpersAsync.should.have.property('b');

    template.page('foo.md', {content: 'A: <%= a(name) %>\nB: <%= b(name) %>'});

    // var lodash = template.getEngine('md');
    var ctx = {name: 'Jon Schlinkert'};

    template.render('foo.md', ctx, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: jon schlinkert\nB: JON SCHLINKERT');
      done();
    });
  });

});
