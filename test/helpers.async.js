/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;

describe('.addAsyncHelper():', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should register _bound_ async helper functions by default:', function () {
    var helpers = template.helpers('md');

    helpers.addAsyncHelper('a', function (str, next) {
      next(null, str.toLowerCase());
    });

    helpers.addAsyncHelper('b', function (str, next) {
      next(null, str.toUpperCase());
    });

    helpers.should.have.properties(['a', 'b']);
    helpers._.asyncHelpers.should.have.properties(['a', 'b']);
  });

  it('should use bound helpers in templates:', function (done) {
    var helpers = template.helpers('md');

    helpers.addAsyncHelper('a', function (str, next) {
      next(null, str.toLowerCase());
    });

    helpers.addAsyncHelper('b', function (str, next) {
      next(null, str.toUpperCase());
    });

    template.page('foo.md', {content: 'A: <%= a(name) %>\nB: <%= b(name) %>'});
    template.render('foo.md', {name: 'Jon Schlinkert'}, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: jon schlinkert\nB: JON SCHLINKERT');
      done();
    });
  });


  it('should register _un-bound_ async helpers when `bindHelpers` is false:', function () {
    template.option('bindHelpers', false);
    var helpers = template.helpers('md');

    helpers
      .addAsyncHelper('a', function (str, next) {
        next(null, str.toLowerCase());
      })
      .addAsyncHelper('b', function (str, next) {
        next(null, str.toUpperCase());
      });


    helpers.should.have.properties(['a', 'b']);
    helpers._.asyncHelpers.should.have.properties(['a', 'b']);
  });


  it('should use _un-bound_ helpers in templates:', function (done) {
    template.option('bindHelpers', false);
    var helpers = template.helpers('md');

    helpers
      .addAsyncHelper('a', function (str, next) {
        next(null, str.toLowerCase());
      })
      .addAsyncHelper('b', function (str, next) {
        next(null, str.toUpperCase());
      });

    template.page('foo.md', {content: 'A: <%= a(name) %>\nB: <%= b(name) %>'});
    template.render('foo.md', {name: 'Jon Schlinkert'}, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: jon schlinkert\nB: JON SCHLINKERT');
      done();
    });
  });

  it('should use helpers registered for all engines:', function (done) {
    template
      .addAsyncHelper('a', function (str, next) {
        next(null, str.toLowerCase());
      })
      .addAsyncHelper('b', function (str, next) {
        next(null, str.toUpperCase());
      });

    template._.asyncHelpers.should.have.properties(['a', 'b']);
    template._.asyncHelpers._.asyncHelpers.should.have.properties(['a', 'b']);

    template.page('foo.md', {content: 'A: <%= a(name) %>\nB: <%= b(name) %>'});

    template.render('foo.md', {name: 'Jon Schlinkert'}, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: jon schlinkert\nB: JON SCHLINKERT');
      done();
    });
  });

});
