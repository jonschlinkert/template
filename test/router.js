/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Engine = require('..');
var template = null;


// Router tests from kerouac
describe('engine router', function() {
  beforeEach(function () {
    template = new Engine();
  });

  describe('with two simple routes', function() {
    beforeEach(function () {
      template.route('/foo', function foo (page, key, next) {
        page.routedToFoo = true;
        next();
      });

      template.route('/bar', function bar (page, key, next) {
        page.routedToBar = true;
        next();
      });
    });

    it('should have routes for default template types.', function() {
      template.router.stack.should.have.length(7);
    });

    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'

      template.middleware(page, page.path, function(err) {
        if (err) return done(err);
        page.routedToFoo.should.be.true;
        (typeof page.routedToBar == 'undefined').should.be.true;
        done();
      });
    });

    it('should dispatch /bar', function(done) {
      var page = {};
      page.path = '/bar';
      page.content = 'this is content';

      template.middleware(page, page.path, function(err) {
        if (err) return done(err);
        (typeof page.routedToFoo == 'undefined').should.be.true;
        page.routedToBar.should.be.true;
        done();
      });
    });

    it('should not dispatch /baz', function(done) {
      var page = {};
      page.path = '/baz'

      template.middleware(page, page.path, function(err) {
        if (err) return done(err);
        (typeof page.routedToFoo == 'undefined').should.be.true;
        (typeof page.routedToBar == 'undefined').should.be.true;
        done();
      });
    });

  });

  describe('with two simple stages', function() {
    beforeEach(function () {
      template.runStage('first', function first (page, key, next) {
        page.stageCalledFirst = true;
        next();
      });

      template.runStage('second', function second (page, key, next) {
        page.stageCalledSecond = true;
        next();
      });
    });

    it('should have stages for default template types.', function() {
      Object.keys(template.router.stages).should.have.length(2);
    });

    it('should dispatch first', function(done) {
      var page = {};
      page.path = '/foo'

      template.stage('first', page, page.path, function(err) {
        if (err) return done(err);
        page.stageCalledFirst.should.be.true;
        (typeof page.stageCalledSecond == 'undefined').should.be.true;
        done();
      });
    });

    it('should dispatch second', function(done) {
      var page = {};
      page.path = '/bar'

      template.stage('second', page, page.path, function(err) {
        if (err) return done(err);
        (typeof page.stageCalledFirst == 'undefined').should.be.true;
        page.stageCalledSecond.should.be.true;
        done();
      });
    });

    it('should not dispatch third', function(done) {
      var page = {};
      page.path = '/baz'

      template.stage('third', page, page.path, function(err) {
        if (err) return done(err);
        (typeof page.stageCalledFirst == 'undefined').should.be.true;
        (typeof page.stageCalledSecond == 'undefined').should.be.true;
        done();
      });
    });

  });

  describe('with route containing multiple callbacks', function() {

    beforeEach(function () {
      template.route('/foo',
        function(page, key, next) {
          page.routedTo = [ '1' ];
          next();
        },
        function(page, key, next) {
          page.routedTo.push('2');
          next();
        },
        function(page, key, next) {
          page.routedTo.push('3');
          next();
        });
    });


    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'

      template.middleware(page, page.path, function(err) {
        if (err) return done(err);
        page.routedTo.should.be.an.instanceOf(Array);
        page.routedTo.should.have.length(3);
        page.routedTo[0].should.equal('1');
        page.routedTo[1].should.equal('2');
        page.routedTo[2].should.equal('3');
        done();
      });
    });

  });

  describe('when routes have multiple callbacks, some of which are skipped:', function() {
    beforeEach(function () {

      template.route('/foo',
        function(page, key, next) {
          page.routedTo = [ 'a1' ];
          next();
        },
        function(page, key, next) {
          page.routedTo.push('a2');
          next('route');
        },
        function(page, key, next) {
          page.routedTo.push('a3');
          next();
        });

      template.route('/foo', function(page, key, next) {
        page.routedTo.push('b1');
        next();
      });
    });

    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'

      template.middleware(page, page.path, function(err) {
        if (err) return done(err);
        page.routedTo.should.be.an.instanceOf(Array);
        page.routedTo.should.have.length(3);
        page.routedTo[0].should.equal('a1');
        page.routedTo[1].should.equal('a2');
        page.routedTo[2].should.equal('b1');
        done();
      });
    });

  });

  describe('when routes are parameterized:', function() {
    beforeEach(function () {

      template.route('/blog/:year/:month/:day/:slug', function(page, key, next) {
        page.gotParams = [];
        page.gotParams.push(this.params['year']);
        page.gotParams.push(this.params['month']);
        page.gotParams.push(this.params['day']);
        page.gotParams.push(this.params['slug']);
        next();
      });

      template.route('/blog/2013/04/20/foo', function(page, key, next) {
        page.blogPage = true;
        next();
      });
    });

    it('should dispatch /blog', function(done) {
      var page = {};
      page.path = '/blog/2013/04/20/foo'

      template.middleware(page, page.path, function(err) {
        if (err) return done(err);
        page.gotParams.should.have.length(4);
        page.gotParams[0].should.equal('2013');
        page.gotParams[1].should.equal('04');
        page.gotParams[2].should.equal('20');
        page.gotParams[3].should.equal('foo');
        page.blogPage.should.be.true;
        done();
      });
    });
  });

  describe('when routes encounter errors:', function() {
    beforeEach(function () {

      template.route('/foo', function(page, key, next) {
        next(new Error('something went wrong'));
      });
    });

    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'

      template.middleware(page, page.path, function(err) {
        err.should.not.be.undefined;
        err.message.should.equal('something went wrong');
        done();
      });
    });
  });

  describe('with route that throws an exception', function() {
    beforeEach(function () {

      template.route('/foo', function(page, key, next) {
        throw new Error('something went horribly wrong');
      });
    });

    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'

      template.middleware(page, page.path, function(err) {
        err.should.not.be.undefined;
        err.message.should.equal('something went horribly wrong');
        done();
      });
    });
  });

  describe('when routes have error handling that is not called:', function() {
    beforeEach(function () {

      template.route('/foo',
        function(page, key, next) {
          page.routedTo = [ '1' ];
          next();
        },
        function(page, key, next) {
          page.routedTo.push('2');
          next();
        },
        function(err, page, key, next) {
          page.routedTo.push('error');
          next();
        });

    });

    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'

      template.middleware(page, page.path, function(err) {
        if (err) return done(err);
        page.routedTo.should.be.an.instanceOf(Array);
        page.routedTo.should.have.length(2);
        page.routedTo[0].should.equal('1');
        page.routedTo[1].should.equal('2');
        done();
      });
    });
  });

  describe('with route containing error handling that is called', function() {
    beforeEach(function () {

      template.route('/foo',
        function(page, key, next) {
          page.routedTo = [ '1' ];
          next(new Error('1 error'));
        },
        function(page, key, next) {
          page.routedTo.push('2');
          next();
        },
        function(err, page, key, next) {
          page.routedTo.push(err.message);
          next();
        });

    });

    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'

      template.middleware(page, page.path, function(err) {
        if (err) return done(err);
        page.routedTo.should.be.an.instanceOf(Array);
        page.routedTo.should.have.length(2);
        page.routedTo[0].should.equal('1');
        page.routedTo[1].should.equal('1 error');
        done();
      });
    });
  });

  describe('with route containing error handling that is called due to an exception', function() {
    beforeEach(function () {

      template.route('/foo',
        function(page, key, next) {
          page.routedTo = [ '1' ];
          wtf;
          next();
        },
        function(page, key, next) {
          page.routedTo.push('2');
          next();
        },
        function(err, page, key, next) {
          page.routedTo.push(err.message);
          next();
        });

    });

    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'

      template.middleware(page, page.path, function(err) {
        if (err) return done(err);
        page.routedTo.should.be.an.instanceOf(Array);
        page.routedTo.should.have.length(2);
        page.routedTo[0].should.equal('1');
        page.routedTo[1].should.equal('wtf is not defined');
        done();
      });
    });

  });
});
