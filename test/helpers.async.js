/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Engine = require('..');
var engine;


describe('.addHelperAsync():', function () {
  beforeEach(function () {
    engine = new Engine();
  });


  it('should register _bound_ async helper functions by default:', function () {
    var helpers = engine.helpers('md');

    helpers.addHelperAsync('a', function (str, callback) {
      callback(null, str.toLowerCase());
    });

    helpers.addHelperAsync('b', function (str, callback) {
      callback(null, str.toUpperCase());
    });

    helpers.should.have.properties(['a', 'b']);
    helpers._.helpersAsync.should.have.properties(['a', 'b']);
  });


  it('should use bound helpers in templates:', function (done) {
    var helpers = engine.helpers('md');

    helpers.addHelperAsync('a', function (str, callback) {
      callback(null, str.toLowerCase());
    });

    helpers.addHelperAsync('b', function (str, callback) {
      callback(null, str.toUpperCase());
    });

    engine.page('foo.md', {content: 'A: <%= a(name) %>\nB: <%= b(name) %>'});
    engine.render('foo.md', {name: 'Jon Schlinkert'}, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: jon schlinkert\nB: JON SCHLINKERT');
      done();
    });
  });


  it('should register _un-bound_ async helpers when `bindHelpers` is false:', function () {
    engine.option('bindHelpers', false);
    var helpers = engine.helpers('md');

    helpers
      .addHelperAsync('a', function (str, callback) {
        callback(null, str.toLowerCase());
      })
      .addHelperAsync('b', function (str, callback) {
        callback(null, str.toUpperCase());
      });


    helpers.should.have.properties(['a', 'b']);
    helpers._.helpersAsync.should.have.properties(['a', 'b']);
  });


  it('should use _un-bound_ helpers in templates:', function (done) {
    engine.option('bindHelpers', false);
    var helpers = engine.helpers('md');

    helpers
      .addHelperAsync('a', function (str, callback) {
        callback(null, str.toLowerCase());
      })
      .addHelperAsync('b', function (str, callback) {
        callback(null, str.toUpperCase());
      });

    engine.page('foo.md', {content: 'A: <%= a(name) %>\nB: <%= b(name) %>'});
    engine.render('foo.md', {name: 'Jon Schlinkert'}, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: jon schlinkert\nB: JON SCHLINKERT');
      done();
    });
  });

  it('should use helpers registered for all engines:', function (done) {
    engine
      .addHelperAsync('a', function (str, callback) {
        callback(null, str.toLowerCase());
      })
      .addHelperAsync('b', function (str, callback) {
        callback(null, str.toUpperCase());
      });

    engine._.asyncHelpers.should.have.properties(['a', 'b']);
    engine._.asyncHelpers._.helpersAsync.should.have.properties(['a', 'b']);

    engine.page('foo.md', {content: 'A: <%= a(name) %>\nB: <%= b(name) %>'});

    engine.render('foo.md', {name: 'Jon Schlinkert'}, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: jon schlinkert\nB: JON SCHLINKERT');
      done();
    });
  });

});
