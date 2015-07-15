'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('globby');
var assert = require('assert');
var should = require('should');
var utils = require('../lib/utils');
var App = require('..');
var app;


describe('views pagination', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
    app.create('list');

  });

  describe('.pagination', function () {
    it('should render a view from the collection:', function (done) {
      app.pages('a.tmpl', {path: 'a.tmpl', content: 'a<%= title %>z', title: 'AAA'});
      app.pages('b.tmpl', {path: 'b.tmpl', content: 'a<%= title %>z', title: 'BBB'});
      app.pages('c.tmpl', {path: 'c.tmpl', content: 'a<%= title %>z', title: 'CCC'});
      app.pages('d.tmpl', {path: 'd.tmpl', content: 'a<%= title %>z', title: 'DDD'});
      app.pages('e.tmpl', {path: 'e.tmpl', content: 'a<%= title %>z', title: 'EEE'});

      app.list('list.hbs', {
        content: 'BEFORE\n{{#each pagination.items}}{{locals.title}}\n{{/each}}\nAFTER',
        locals: {
          limit: 2,
          permalinks: {
            structure: ':collection/:num.html'
          }
        }
      });

      var list = app.list.get('list.hbs');

      app.pages.paginate(function (err, pages) {
        // console.log(pages)
      });

      app.pages.render('a.tmpl', {}, function (err, res) {
        if (err) return done(err);
        // res.content.should.equal('abbbz');
        done();
      });
    });
  });
});
