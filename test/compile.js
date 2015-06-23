'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app

describe('engines', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('pages');
  })

  it('should compile a template:', function (done) {
    app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= a %>', a: 'b'});
    var page = app.pages.get('a.tmpl');

    app.compile(page, function (err, view) {
      assert.equal(typeof view.fn, 'function');
      done();
    });
  });
});
