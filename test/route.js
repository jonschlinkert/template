/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var async = require('async');
var consolidate = require('consolidate');
var parser = require('parser-front-matter');
var forOwn = require('for-own');
var Template = require('./app');
var Route = Template.Route;
var template = null;

describe('template.route()', function () {
  describe('.handle()', function () {
    beforeEach(function () {
      template = new Template();
      template.enable('frontMatter');
    });

    it.skip('should do nothing when the router is null', function (done) {
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
      var keys = Object.keys(template.views.pages);
      async.each(keys, function (key, next) {
        var file = template.views.pages[key];
        template.handle(file, function (err) {
          if (err) {
            doneCalled = true;
            return done(err);
          }
          switch (key) {
            case 'a.hbs':
              file.path.should.eql('a.hbs');
              file.data.should.eql({});
              file.locals.should.have.property('author', 'Jon Schlinkert');
              break;
            case 'b.tmpl':
              file.path.should.eql('b.tmpl');
              file.data.should.eql({});
              file.locals.should.have.property('author', 'Jon Schlinkert');
              break;
            case 'd.swig':
              file.path.should.eql('d.swig');
              file.data.should.eql({});
              file.locals.should.have.property('author', 'Jon Schlinkert');
              break;
            case 'e.swig':
              file.path.should.eql('e.swig');
              file.data.should.eql({});
              file.locals.should.have.property('author', 'Jon Schlinkert');
              break;
            case 'f.hbs':
              file.path.should.eql('f.hbs');
              file.data.should.eql({});
              file.locals.should.have.property('author', 'Jon Schlinkert');
              break;
            case 'g.md':
              file.path.should.eql('g.md');
              file.data.should.have.property('author', 'Brian Woodward');
              file.locals.should.have.property('author', 'Jon Schlinkert');
              break;
          }
          next();
        });
      }, done);
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
      route.stack.should.be.an.array;
      route.stack.should.have.length(1);
    });
  });

  describe('.dispatch()', function () {
    beforeEach(function () {
      template = new Template();
    });
    it('should add a middleware stack before dispatching', function () {
      var page = {foo: {path: 'foo.md', content: 'this is content..', options: {}}};
      template.dispatch('onLoad', page, [function (file, next) {
        file.data.foo = 'bar';
        next();
      }]);
      page.foo.data.foo.should.eql('bar');
    });
  });

  // Route tests from kerouac
  describe('with parameterized path', function () {
    var route;
    beforeEach(function () {
      template = new Template();
      // template.page('')
    });
    // var route = new Route('/blog/:year/:month/:day/:slug').all([
    //   function () {}
    // ]);

    it('should return a new `Route` instance', function () {
      route = template.route('/blog/:year/:month/:day/:slug').all([
        function () {}
      ]);
    });

    it('should have path property', function () {
      route.path.should.equal('/blog/:year/:month/:day/:slug');
    });

    it('should have stack property', function () {
      route.stack.should.be.instanceof(Array);
      route.stack.should.have.length(1);
    });

    it('should match correctly', function () {
      template.option('relative', false);
      template.option('renameKey', function (fp) {
        return fp;
      });
      template.page('/blog/2015/04/18/hello-world', {content: 'this is content...'});
      // route.match('/blog/2015/04/18/hello-world')//.should.be.true;
      template.dispatch('onLoad', template.views.pages, [function (file, next) {
        // file.data.foo = 'bar';
        next();
      }]);

      // route.params.should.be.instanceof(Object);
      // Object.keys(route.params).should.have.length(4);
      // route.params.year.should.equal('2015');
      // route.params.month.should.equal('04');
      // route.params.day.should.equal('18');
      // route.params.slug.should.equal('hello-world');

      // route.match('/blog/2015/04/18').should.be.false;
      // route.match('/not-blog/2015/04/18/hello-world').should.be.false;
    });
  });
});
