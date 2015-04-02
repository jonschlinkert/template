/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('./app');
var template;


// Router tests from kerouac
describe('template.router()', function() {
  beforeEach(function () {
    template = new Template();
  });

  describe('with two simple routes', function() {
    beforeEach(function () {
      template.route('/foo').all(function foo (file, next) {
        file.routedToFoo = true;
        next();
      });

      template.route('/bar').all(function bar (file, next) {
        file.routedToBar = true;
        next();
      });
    });

    it('should have routes for default template types.', function() {
      template.router.stack.should.have.length(3);
    });

    it('should dispatch /foo', function(done) {
      var file = {};
      file.path = '/foo'

      template.handle(file, function(err) {
        if (err) return done(err);
        file.routedToFoo.should.be.true;
        (typeof file.routedToBar == 'undefined').should.be.true;
        done();
      });
    });

    it('should dispatch /bar', function(done) {
      var file = {};
      file.path = '/bar';
      file.content = 'this is content';

      template.handle(file, function(err) {
        if (err) return done(err);
        (typeof file.routedToFoo == 'undefined').should.be.true;
        file.routedToBar.should.be.true;
        done();
      });
    });

    it('should not dispatch /baz', function(done) {
      var file = {};
      file.path = '/baz'

      template.handle(file, function(err) {
        if (err) return done(err);
        (typeof file.routedToFoo == 'undefined').should.be.true;
        (typeof file.routedToBar == 'undefined').should.be.true;
        done();
      });
    });

  });

  describe('with route containing multiple callbacks', function() {

    beforeEach(function () {
      template.route('/foo').all(
        function(file, next) {
          file.routedTo = [ '1' ];
          next();
        },
        function(file, next) {
          file.routedTo.push('2');
          next();
        },
        function(file, next) {
          file.routedTo.push('3');
          next();
        });
    });


    it('should dispatch /foo', function(done) {
      var file = {};
      file.path = '/foo'

      template.handle(file, function(err) {
        if (err) return done(err);
        file.routedTo.should.be.an.instanceOf(Array);
        file.routedTo.should.have.length(3);
        file.routedTo[0].should.equal('1');
        file.routedTo[1].should.equal('2');
        file.routedTo[2].should.equal('3');
        done();
      });
    });

  });

  describe('when routes have multiple callbacks, some of which are skipped:', function() {
    beforeEach(function () {

      template.route('/foo').all(
        function(file, next) {
          file.routedTo = [ 'a1' ];
          next();
        },
        function(file, next) {
          file.routedTo.push('a2');
          next('route');
        },
        function(file, next) {
          file.routedTo.push('a3');
          next();
        });

      template.route('/foo').all(function(file, next) {
        file.routedTo.push('b1');
        next();
      });
    });

    it('should dispatch /foo', function(done) {
      var file = {};
      file.path = '/foo'

      template.handle(file, function(err) {
        if (err) return done(err);
        file.routedTo.should.be.an.instanceOf(Array);
        file.routedTo.should.have.length(3);
        file.routedTo[0].should.equal('a1');
        file.routedTo[1].should.equal('a2');
        file.routedTo[2].should.equal('b1');
        done();
      });
    });

  });

  describe('when routes are parameterized:', function() {
    beforeEach(function () {

      template.route('/blog/:year/:month/:day/:slug').all(function(file, next) {
        file.gotParams = [];
        file.gotParams.push(file.options.params['year']);
        file.gotParams.push(file.options.params['month']);
        file.gotParams.push(file.options.params['day']);
        file.gotParams.push(file.options.params['slug']);
        next();
      });

      template.route('/blog/2013/04/20/foo').all(function(file, next) {
        file.blogPage = true;
        next();
      });
    });

    it('should dispatch /blog', function(done) {
      var file = {};
      file.path = '/blog/2013/04/20/foo'

      template.handle(file, function(err) {
        if (err) return done(err);
        file.gotParams.should.have.length(4);
        file.gotParams[0].should.equal('2013');
        file.gotParams[1].should.equal('04');
        file.gotParams[2].should.equal('20');
        file.gotParams[3].should.equal('foo');
        file.blogPage.should.be.true;
        done();
      });
    });
  });

  describe('when routes encounter errors:', function() {
    beforeEach(function () {

      template.route('/foo').all(function(file, next) {
        next(new Error('something went wrong'));
      });
    });

    it('should dispatch /foo', function(done) {
      var file = {};
      file.path = '/foo'

      template.handle(file, function(err) {
        err.should.not.be.undefined;
        err.message.should.equal('something went wrong');
        done();
      });
    });
  });

  describe('with route that throws an exception', function() {
    beforeEach(function () {

      template.route('/foo').all(function(file, next) {
        throw new Error('something went horribly wrong');
      });
    });

    it('should dispatch /foo', function(done) {
      var file = {};
      file.path = '/foo'

      template.handle(file, function(err) {
        err.should.not.be.undefined;
        err.message.should.equal('something went horribly wrong');
        done();
      });
    });
  });

  describe('when routes have error handling that is not called:', function() {
    beforeEach(function () {

      template.route('/foo').all(
        function(file, next) {
          file.routedTo = [ '1' ];
          next();
        },
        function(file, next) {
          file.routedTo.push('2');
          next();
        },
        function(err, file, next) {
          file.routedTo.push('error');
          next();
        });

    });

    it('should dispatch /foo', function(done) {
      var file = {};
      file.path = '/foo'

      template.handle(file, function(err) {
        if (err) return done(err);
        file.routedTo.should.be.an.instanceOf(Array);
        file.routedTo.should.have.length(2);
        file.routedTo[0].should.equal('1');
        file.routedTo[1].should.equal('2');
        done();
      });
    });
  });

  describe('with route containing error handling that is called', function() {
    beforeEach(function () {

      template.route('/foo').all(
        function(file, next) {
          file.routedTo = [ '1' ];
          next(new Error('1 error'));
        },
        function(file, next) {
          file.routedTo.push('2');
          next();
        },
        function(err, file, next) {
          file.routedTo.push(err.message);
          next();
        });

    });

    it('should dispatch /foo', function(done) {
      var file = {};
      file.path = '/foo'

      template.handle(file, function(err) {
        if (err) return done(err);
        file.routedTo.should.be.an.instanceOf(Array);
        file.routedTo.should.have.length(2);
        file.routedTo[0].should.equal('1');
        file.routedTo[1].should.equal('1 error');
        done();
      });
    });
  });

  describe('with route containing error handling that is called due to an exception', function() {
    beforeEach(function () {

      template.route('/foo').all(
        function(file, next) {
          file.routedTo = [ '1' ];
          wtf;
          next();
        },
        function(file, next) {
          file.routedTo.push('2');
          next();
        },
        function(err, file, next) {
          file.routedTo.push(err.message);
          next();
        });

    });

    it('should dispatch /foo', function(done) {
      var file = {};
      file.path = '/foo'

      template.handle(file, function(err) {
        if (err) return done(err);
        file.routedTo.should.be.an.instanceOf(Array);
        file.routedTo.should.have.length(2);
        file.routedTo[0].should.equal('1');
        file.routedTo[1].should.equal('wtf is not defined');
        done();
      });
    });

  });
});

describe.skip('template.use()', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should support .use of other routers', function(done) {
    var page = { path: '/foo/bar' };
    var another = new Template.Router();
    another.all('/bar', function(file, next) {
      file.path.should.equal('/bar');
      file.options.basePath.should.equal('/foo');
      file.options.originalPath.should.equal('/foo/bar');
      file.data = file.data || {};
      file.data.another = true;
      next();
    });
    template.use('/foo', another);
    template.handle(page, function (err) {
      if (err) return done(err);
      page.data.another.should.be.true;
      done();
    });
  });

  it('should support .use with multiple middleware', function(done) {
    var page = { path: '/foo/bar' };
    function first (file, next) {
      file.data = file.data || {};
      file.data.first = true;
      next();
    }
    function second (file, next) {
      file.data = file.data || {};
      file.data.second = true;
      next();
    }

    template.use('/foo/bar', first, second);
    template.handle(page, function (err) {
      if (err) return done(err);
      page.data.first.should.be.true;
      page.data.second.should.be.true;
      done();
    });
  });

  it('should throw error when no middleware is passed', function(done) {
    var page = { path: '/foo/bar' };
    try {
      template.use('/foo/bar');
      done(new Error('Expected an error to be thrown.'));
    } catch (err) {
      if (err) return done();
      done(new Error('Expected an error to be thrown'));
    }
  });

  it('should handle an array as the first argument', function(done) {
    var page = { path: '/foo/bar' };
    function first (file, next) {
      file.data = file.data || {};
      file.data.first = true;
      next();
    }
    function second (file, next) {
      file.data = file.data || {};
      file.data.second = true;
      next();
    }

    template.use(['/foo/bar'], first, second);
    template.handle(page, function (err) {
      if (err) return done(err);
      page.data.first.should.be.true;
      page.data.second.should.be.true;
      done();
    });
  });

  it('should use child template objects', function() {
    var child = new Template();
    var page = { path: '/foo/bar' };
    child.all('/bar', function(file, next) {
      file.path.should.equal('/bar');
      file.options.basePath.should.equal('/foo');
      file.options.originalPath.should.equal('/foo/bar');
      file.data = file.data || {};
      file.data.another = true;
      next();
    });
    template.use('/foo', child);
    child.mountpath.should.equal('/foo');
    child.parent.should.equal(template);
  });
});

describe('template.param()', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should support .param', function (done) {
    var page = { path: '/posts/tests/2014-11-30' };
    template.param(['category', 'posted'], function (file, next, value) {
      file.data = file.data || {};
      if (file.options.params.category === value) {
        file.data.relatedCategories = ['coverage', 'benchmarks'];
      }
      if (file.options.params.posted === value) {
        file.data.archived = file.data.archived || {};
        var month = new Date(value).getMonth() + 1;
        var year = new Date(value).getYear() + 2000 - 100;
        file.data.archived['' + year + '-' + month] = ['2014-11-01', '2014-11-15', '2014-11-20'];
      }
      next();
    });
    template.all('/posts/:category/:posted', function (file, next) {
      var posted = file.options.params.posted;
      var month = new Date(posted).getMonth() + 1;
      var year = new Date(posted).getYear() + 2000 - 100;
      file.data.relatedCategories.length.should.eql(2);
      file.data.archived['' + year + '-' + month].length.should.eql(3);
      next();
    });
    template.handle(page, function (err) {
      if (err) return done(err);
      done();
    });
  });
});
