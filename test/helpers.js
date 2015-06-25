'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app

describe('sync helpers', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
  })

  it('should register a helper:', function () {
    app.helper('a', function () {});
    app.helper('b', function () {});
    app._.helpers.sync.should.have.property('a');
    app._.helpers.sync.should.have.property('b');
  });

  it('should use a helper:', function (done) {
    app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= upper(a) %>', a: 'bbb'});
    app.helper('upper', function (str) {
      return str.toUpperCase();
    });

    var page = app.pages.get('a.tmpl');
    app.render(page, function (err, view) {
      console.log(err);
      if (err) return done(err);

      assert.equal(typeof view.content, 'string');
      assert.equal(view.content, 'BBB');
      done();
    });
  });
});

describe('async helpers', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
  })

  it('should register an async helper:', function () {
    app.asyncHelper('a', function () {});
    app.asyncHelper('b', function () {});
    app._.helpers.async.should.have.property('a');
    app._.helpers.async.should.have.property('b');
  });


  // it.only('should use an async helper:', function (done) {
  //   app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= lower(a) %>', a: 'BBB'});
  //   app.asyncHelper('lower', function (str, next) {
  //     next(null, str.toUpperCase());
  //   });

  //   var page = app.pages.get('a.tmpl');
  //   app.render(page, function (err, view) {
  //     if (err) return done(err);
  //     // console.log(arguments)
  //     // assert.equal(typeof view.content, 'string');
  //     // assert.equal(view.content, 'BBB');
  //     done();
  //   });
  // });
});
