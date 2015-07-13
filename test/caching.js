'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('caching', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
  });

  describe('when a method with caching enabled is called multiple times:', function () {
    it('should return the cached result when the args are the same:', function () {
      app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= a %>', a: 'bbb'});

      // ensure that the cache is empty
      app.pages.get('a.tmpl')._cache.should.eql({});

      var parsed = {
        path: {
          root: '',
          dirname: '',
          basename: 'a.tmpl',
          extname: '.tmpl',
          name: 'a',
          ext: '.tmpl'
        }
      };

      // call `parsePath`
      app.pages.get('a.tmpl').parsePath();
      app.pages.get('a.tmpl')._cache.should.eql(parsed);

      app.pages.get('a.tmpl').parsePath();
      app.pages.get('a.tmpl').parsePath();
      app.pages.get('a.tmpl').parsePath();
      app.pages.get('a.tmpl').parsePath();
      app.pages.get('a.tmpl')._cache.should.eql(parsed);
    });

    it('find:', function () {
      app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= a %>', a: 'bbb'});

      // ensure that the cache is empty
      app.pages.get('a.tmpl')._cache.should.eql({});
      
      var page = app.pages.find('a.*');
      page._cache.should.have.property('a.*');
    });
  });
});
