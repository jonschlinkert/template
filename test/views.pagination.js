'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('globby');
var assert = require('assert');
var should = require('should');
var utils = require('../lib/utils');
var once = require('once');
var App = require('..');
var app;


describe('views pagination', function () {
  beforeEach(function () {
    app = new App();
    app.engine('hbs', require('engine-handlebars'));
    app.create('page');
    app.create('list');

  });

  describe('.pagination', function () {
    it('should render a paginated list from a views collection:', function (done) {
      done = once(done);

      app.pages('a.hbs', {path: 'a.hbs', content: 'a<%= title %>z', title: 'AAA'});
      app.pages('b.hbs', {path: 'b.hbs', content: 'a<%= title %>z', title: 'BBB'});
      app.pages('c.hbs', {path: 'c.hbs', content: 'a<%= title %>z', title: 'CCC'});
      app.pages('d.hbs', {path: 'd.hbs', content: 'a<%= title %>z', title: 'DDD'});
      app.pages('e.hbs', {path: 'e.hbs', content: 'a<%= title %>z', title: 'EEE'});

      app.list('list.hbs', {
        content: 'BEFORE\n{{#each pagination.items}}{{locals.title}}\n{{/each}}\nAFTER',
        locals: {
          limit: 2,
          permalinks: {
            structure: ':collection/:num.html'
          }
        }
      });

      var list = app.lists.get('list.hbs');

      app.views.pages
        .paginate(list, {limit: 2})
        .render({}, function (err, res) {
          if (err) return done(err);

          res.length.should.equal(3);
          res.forEach(function (ele) {
            ele.content.should.match(/AAA|BBB|CCC|DDD|EEE/);
          });

          done();
        });
    });

    it('should chain the `.pagination` method from the collection loader method:', function (done) {
      done = once(done);
      app.pages('a.hbs', {path: 'a.hbs', content: 'a<%= title %>z', title: 'AAA'});
      app.pages('b.hbs', {path: 'b.hbs', content: 'a<%= title %>z', title: 'BBB'});
      app.pages('c.hbs', {path: 'c.hbs', content: 'a<%= title %>z', title: 'CCC'});
      app.pages('d.hbs', {path: 'd.hbs', content: 'a<%= title %>z', title: 'DDD'});
      app.pages('e.hbs', {path: 'e.hbs', content: 'a<%= title %>z', title: 'EEE'});

      app.list('list.hbs', {
        content: 'BEFORE\n{{#each pagination.items}}{{locals.title}}\n{{/each}}\nAFTER',
        locals: {
          limit: 2,
          permalinks: {
            structure: ':collection/:num.html'
          }
        }
      });

      var list = app.lists.get('list.hbs');

      var res = app.pages.paginate(list, {limit: 2});
      res.items.length.should.equal(3);

      res.render({}, function (err, res) {
        if (err) return done(err);

        res.length.should.equal(3);
        res.forEach(function (ele) {
          ele.content.should.match(/AAA|BBB|CCC|DDD|EEE/);
        });

        done();
      });
    });
  });
});
