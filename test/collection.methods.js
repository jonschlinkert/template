'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('globby');
var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('view.option()', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.loader('glob', glob.sync.bind(glob));

    app.loader('toView', function toView(fp) {
      var view = {path: fp, content: fs.readFileSync(fp, 'utf8')};
      this.app.emit('data', fp, view);
      return view;
    });

    app.loader('toTemplate', function toTemplate(acc, fp) {
      acc[fp] = this.app.compose('toView')(fp);
      return acc;
    });

    app.loader('toViews', function toViews(files) {
      return files.reduce(function (acc, fp) {
        this.app.compose('toTemplate')(acc, fp);
        return acc;
      }.bind(this), {});
    });

    app.create('page', { loaderType: 'sync' }, ['toViews']);
    app.loaders.first('pages', ['glob']);
  });

  describe('loaders', function () {
    it('should use generic loaders:', function () {
      app.pages('test/fixtures/*.txt');
      console.log(app.views.pages);
    });
  });

  // describe('.use', function () {
  //   it('should expose `.use` for running plugins on a view:', function () {
  //     app.pages('test/fixtures/*.txt', ['toViews'])
  //       .render('a.tmpl', function (err, res) {
  //         if (err) return console.log(err);
  //         console.log(res);
  //       });

  //   });
  // });

  // describe('.render:', function (done) {
  //   it('should expose `.render` for rendering a view:', function (done) {
  //     app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= a %>', a: 'bbb'});
  //     var page = app.pages.get('a.tmpl');

  //     page.render({}, function (err, res) {
  //       if (err) return done(err);
  //       res.content.should.equal('bbb');
  //       done();
  //     });
  //   });
  // });

  // describe('.context', function (done) {
  //   it('should expose `.context` for calculating the context of a view:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>'});
  //     var page = app.pages.get('foo.tmpl');
  //     assert.equal(typeof page.context, 'function');
  //     done();
  //   });

  //   it('should calculate view locals:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}});
  //     var page = app.pages.get('foo.tmpl');
  //     var ctx = page.context();
  //     ctx.should.eql({a: 'b'});
  //     done();
  //   });

  //   it('should calculate view data:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {c: 'd'}});
  //     var page = app.pages.get('foo.tmpl');
  //     var ctx = page.context();
  //     ctx.should.eql({a: 'b', c: 'd'});
  //     done();
  //   });

  //   it('should give locals preference over data:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {a: 'd'}});
  //     var page = app.pages.get('foo.tmpl');
  //     var ctx = page.context();
  //     ctx.should.eql({a: 'b'});
  //     done();
  //   });

  //   it('should extend the context with an object passed to the method:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {a: 'd'}});
  //     var page = app.pages.get('foo.tmpl');
  //     var ctx = page.context({foo: 'bar'});
  //     ctx.should.eql({a: 'b', foo: 'bar'});
  //     done();
  //   });

  //   it('should extend `view.locals` with the object passed to the method:', function (done) {
  //     app.pages('foo.tmpl', {path: 'foo.tmpl', content: '<%= a %>', locals: {a: 'b'}, data: {a: 'd'}});
  //     var page = app.pages.get('foo.tmpl');
  //     var ctx = page.context({foo: 'bar'});
  //     page.locals.should.eql({a: 'b', foo: 'bar'});
  //     done();
  //   });
  // });
});
