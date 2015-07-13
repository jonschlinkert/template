'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('parse path', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
  });

  describe('.parsePath:', function () {
    it('should parse `view.path` and return an object:', function () {
      app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= a %>', a: 'bbb'});
      
      var parsed = app.pages.get('a.tmpl').parsePath();
      parsed.should.have.property('basename', 'a.tmpl');
      parsed.should.have.property('extname', '.tmpl');
    });
  });
});
