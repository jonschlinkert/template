'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('matched');
var assert = require('assert');
var should = require('should');
var utils = require('../lib/utils');
var App = require('..');
var app;


describe('views render', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
  });

  describe('.render', function () {
    it('should render a view from the collection:', function (done) {
      app.pages('a.tmpl', {path: 'a.tmpl', content: 'a<%= a %>z', a: 'bbb'});

      app.pages.render('a.tmpl', {}, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('abbbz');
        done();
      });
    });
  });
});
