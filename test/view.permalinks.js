'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe.skip('permalinks', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
  });

  describe('.render:', function (done) {
    it('should expose `.render` for rendering a view:', function (done) {
      app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= a %>', a: 'bbb'});
      var page = app.pages.get('a.tmpl');

      page.render({}, function (err, res) {
        if (err) return done(err);
        console.log(res)
        res.content.should.equal('bbb');
        done();
      });
    });
  });
});
