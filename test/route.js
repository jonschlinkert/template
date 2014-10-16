/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var consolidate = require('consolidate');
var forOwn = require('for-own');
var should = require('should');
var _ = require('lodash');

var Template = require('..');
var template = null;

// Route tests from kerouac
describe('template route', function () {

  describe('.middleware', function () {
    beforeEach(function () {
      template = new Template();
    });

    it('should run default middleware', function (done) {
      template.engine('hbs', consolidate.handlebars);
      template.engine('md', consolidate.handlebars);
      template.engine('jade', consolidate.jade);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      template.page({path: 'a.hbs', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});
      template.page({path: 'b.tmpl', content: '<title><%= author %></title>', author: 'Jon Schlinkert'});
      template.page({path: 'c.jade', content: 'title= author', author: 'Jon Schlinkert'});
      template.page({path: 'd.swig', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});
      template.page({'e.swig': {content: '<title>{{author}}</title>', author: 'Jon Schlinkert'}});
      template.page('f.hbs', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});
      template.page('g.md', '---\nauthor: Brian Woodward\n---\n<title>{{author}}</title>', {author: 'Jon Schlinkert'});

      forOwn(template.cache.pages, function (value, key) {
        console.log('before', key);
        console.log(value);
        console.log();
        template.middleware(value, key, function (err) {
          console.log('after', key);
          console.log(value);
          console.log();
        });
      });
      done();
    });
  });


  // describe('with path', function () {
  //   var route = new Route('/welcome', [
  //     function () {}
  //   ]);

  //   it('should have path property', function () {
  //     route.path.should.equal('/welcome');
  //   });

  //   it('should have fns property', function () {
  //     route.fns.should.be.instanceof(Array);
  //     route.fns.should.have.length(1);
  //   });

  //   it('should have whole path', function () {
  //     route.isWholePath().should.be.true;
  //   });

  //   it('should match correctly', function () {
  //     route.match('/welcome').should.be.true;
  //     route.match('/not-welcome').should.be.false;
  //   });
  // });


  // describe('with parameterized path', function () {
  //   var route = new Route('/blog/:year/:month/:day/:slug', [
  //     function () {}
  //   ]);

  //   it('should have path property', function () {
  //     route.path.should.equal('/blog/:year/:month/:day/:slug');
  //   });

  //   it('should have fns property', function () {
  //     route.fns.should.be.instanceof(Array);
  //     route.fns.should.have.length(1);
  //   });

  //   it('should not have whole path', function () {
  //     route.isWholePath().should.be.false;
  //   });

  //   it('should match correctly', function () {
  //     route.match('/blog/2013/04/18/hello-world').should.be.true;
  //     route.params.should.be.instanceof(Object);
  //     Object.keys(route.params).should.have.length(4);
  //     route.params.year.should.equal('2013');
  //     route.params.month.should.equal('04');
  //     route.params.day.should.equal('18');
  //     route.params.slug.should.equal('hello-world');

  //     route.match('/blog/2013/04/18').should.be.false;
  //     route.match('/not-blog/2013/04/18/hello-world').should.be.false;
  //   });
  // });
});