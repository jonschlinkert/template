/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var consolidate = require('consolidate');
var parser = require('parser-front-matter');
var forOwn = require('for-own');
var should = require('should');
var Template = require('..');
var Route = Template.Route;
var template = null;

describe('template.route()', function () {

  describe('.handle()', function () {
    beforeEach(function () {
      template = new Template();
    });

    it('should do nothing when the router is null', function (done) {
      template.router = null;
      template.handle({}, done);
    });

    it('should run default routes', function (done) {
      template.engine('hbs', consolidate.handlebars);
      template.engine('md', consolidate.handlebars);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      template.page({path: 'a.hbs', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});
      template.page({path: 'b.tmpl', content: '<title><%= author %></title>', author: 'Jon Schlinkert'});
      template.page({path: 'd.swig', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});
      template.page({'e.swig': {content: '<title>{{author}}</title>', author: 'Jon Schlinkert'}});
      template.page('f.hbs', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});
      template.page('g.md', '---\nauthor: Brian Woodward\n---\n<title>{{author}}</title>', {author: 'Jon Schlinkert'});

      var doneCalled = false;
      forOwn(template.views.pages, function (value, key) {
        template.handle(value, function (err) {
          if (err) {
            doneCalled = true;
            return done(err);
          }
          switch (key) {
            case 'a.hbs':
              value.path.should.eql('a.hbs');
              value.data.should.eql({});
              value.locals.should.eql({author: 'Jon Schlinkert'});
              break;
            case 'b.tmpl':
              value.path.should.eql('b.tmpl');
              value.data.should.eql({});
              value.locals.should.eql({author: 'Jon Schlinkert'});
              break;
            case 'd.swig':
              value.path.should.eql('d.swig');
              value.data.should.eql({});
              value.locals.should.eql({author: 'Jon Schlinkert'});
              break;
            case 'e.swig':
              value.path.should.eql('e.swig');
              value.data.should.eql({});
              value.locals.should.eql({author: 'Jon Schlinkert'});
              break;
            case 'f.hbs':
              value.path.should.eql('f.hbs');
              value.data.should.eql({});
              value.locals.should.eql({author: 'Jon Schlinkert'});
              break;
            case 'g.md':
              value.path.should.eql('g.md');
              value.data.should.eql({author: 'Brian Woodward'});
              value.locals.should.eql({author: 'Jon Schlinkert'});
              break;
          }
        });
      });
      if (!doneCalled) done();
    });
  });

  describe('with path', function () {
    var route = new Route('/welcome').all([
      function () {}
    ]);

    it('should have path property', function () {
      route.path.should.equal('/welcome');
    });

    it('should have stack property', function () {
      route.stack.should.be.instanceof(Array);
      route.stack.should.have.length(1);
    });
  });

  describe('.dispatch()', function () {
    beforeEach(function () {
      template = new Template();
    });
    it('should add a middleware stack before dispatching', function () {
      var page = {foo: {path: 'foo.md', options: {}}};
      template.dispatch(page, [function (file, next) {
        file.data.foo = 'bar';
        next();
      }]);
      page.foo.data.foo.should.eql('bar');
    });
  });

  // Route tests from kerouac
  describe('with parameterized path', function () {
    var route = new Route('/blog/:year/:month/:day/:slug').all([
      function () {}
    ]);

    it('should have path property', function () {
      route.path.should.equal('/blog/:year/:month/:day/:slug');
    });

    it('should have stack property', function () {
      route.stack.should.be.instanceof(Array);
      route.stack.should.have.length(1);
    });

    // it('should match correctly', function () {
    //   route.match('/blog/2015/04/18/hello-world').should.be.true;
    //   route.params.should.be.instanceof(Object);
    //   Object.keys(route.params).should.have.length(4);
    //   route.params.year.should.equal('2015');
    //   route.params.month.should.equal('04');
    //   route.params.day.should.equal('18');
    //   route.params.slug.should.equal('hello-world');

    //   route.match('/blog/2015/04/18').should.be.false;
    //   route.match('/not-blog/2015/04/18/hello-world').should.be.false;
    // });
  });
});
