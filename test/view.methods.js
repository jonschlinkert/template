'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('view.option()', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('page');
  });


  describe('.use', function () {
    it('should expose `.use` for running plugins on a view:', function () {
      app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= a %>'});
      var page = app.pages.get('a.tmpl')
        .use(function () {
          this.options.foo = 'bar';
        })
        .use(function () {
          this.options.bar = 'baz';
        })

      page.options.should.have.property('foo');
      page.options.should.have.property('bar');
    });
  });

  describe('.render:', function (done) {
    it('should expose `.render` for rendering a view:', function (done) {
      app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= a %>', a: 'bbb'});
      var page = app.pages.get('a.tmpl');

      page.render({}, function (err, res) {
        if (err) return done(err);
        res.content.should.equal('bbb');
        done();
      });
    });
  });
});
