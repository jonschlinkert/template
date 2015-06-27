'use strict';

var assert = require('assert');
var should = require('should');
var App = require('..');
var app;

describe('loaders', function () {
  describe('sync', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should register an iterator:', function () {
      app.iterator('sync', function () {});
      app.loaders.sync.should.have.property('iterator');
      app.loaders.sync.iterator.should.have.property('fn');
      assert.equal(typeof app.loaders.sync.iterator.fn, 'function');
    });

    it('should register a sync loader by default:', function () {
      app.loader('a', function () {});
      app.loaders.sync.should.have.property('a');
    });

    it('should register a loader:', function () {
      app.iterator('async', function () {});
      app.loader('a', {loaderType: 'async'}, function () {});
      app.loaders.should.have.property('async');
      app.loaders.async.should.have.property('a');
    });
  });

  describe('async', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should register an async iterator:', function () {
      app.iterator('async', function () {});
      app.loaders.async.should.have.property('iterator');
      app.loaders.async.iterator.should.have.property('fn');
      assert.equal(typeof app.loaders.async.iterator.fn, 'function');
    });

    it('should register a sync loader by default:', function () {
      app.loader('a', function () {});
      app.loaders.sync.should.have.property('a');
    });

    it('should register a loader:', function () {
      app.iterator('async', function () {});
      app.loader('a', {loaderType: 'async'}, function () {});
      app.loaders.should.have.property('async');
      app.loaders.async.should.have.property('a');
    });
  });

  describe('promise', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should register an iterator:', function () {
      app.iterator('sync', function () {});
      app.loaders.sync.should.have.property('iterator');
      app.loaders.sync.iterator.should.have.property('fn');
      assert.equal(typeof app.loaders.sync.iterator.fn, 'function');
    });

    it('should register a sync loader by default:', function () {
      app.loader('a', function () {});
      app.loaders.sync.should.have.property('a');
    });

    it('should register a loader:', function () {
      app.iterator('async', function () {});
      app.loader('a', {loaderType: 'async'}, function () {});
      app.loaders.should.have.property('async');
      app.loaders.async.should.have.property('a');
    });
  });

  describe('stream', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should register an iterator:', function () {
      app.iterator('sync', function () {});
      app.loaders.sync.should.have.property('iterator');
      app.loaders.sync.iterator.should.have.property('fn');
      assert.equal(typeof app.loaders.sync.iterator.fn, 'function');
    });

    it('should register a sync loader by default:', function () {
      app.loader('a', function () {});
      app.loaders.sync.should.have.property('a');
    });

    it('should register a loader:', function () {
      app.iterator('async', function () {});
      app.loader('a', {loaderType: 'async'}, function () {});
      app.loaders.should.have.property('async');
      app.loaders.async.should.have.property('a');
    });
  });
});

'use strict';

var should = require('should');
var _ = require('lodash');
var App = require('./app');
var globber = require('./lib/globber');
var app;

describe('template loaders', function () {
  beforeEach(function () {
    app = new App();
    app.engine('md', require('engine-lodash'));
  });

  describe('when a custom loader stack is set:', function () {
    it('should allow custom loader stack to be used:', function () {
      var options = {};
      app.create('post', { isRenderable: true },
        function (patterns) {
          return globber(patterns, options);
        },
        function (file) {
          _.forIn(file, function (value, key) {
            value.options = value.options || {};
          });
          return file;
        },
        function (file) {
          return file;
        });
      app.posts(__dirname + '/fixtures/layouts/matter/*.md');
      app.views.posts.should.have.properties(['a.md', 'b.md', 'c.md', 'd.md']);
    });

    it('should load templates from files using a custom function:', function () {
      app.create('post', { isRenderable: true }, function (patterns, opts) {
        return globber(patterns, opts);
      });
      app.post('test/fixtures/*.md');
      app.views.posts.should.have.property('md.md');
    });

    it('should load templates from files using a custom function:', function () {
      var options = {};
      app.create('post', { isRenderable: true },
        function (patterns) {
          return globber(patterns, options);
        },
        function (template) {
          _.transform(template, function (acc, value, key) {
            acc[key] = JSON.parse(value.content)[key];
          });
          return template
        });
      app.post('test/fixtures/loaders/npm-load.json');
      app.views.posts.should.have.property('npm-load.json');
    });

    it('should modify data:', function (done) {
      var options = {};
      app.data('test/fixtures/data/*.json');
      app.create('post', { isRenderable: true },
        function (patterns) {
          return globber(patterns, options);
        },
        function (template) {
          _.transform(template, function (acc, value, key) {
            value.options = value.options || {};
            value.data = value.data || {};
            value.data.a = 'b';
          });
          return template;
        });

      app.post('test/fixtures/*.md');
      app.render('md.md', function (err, content) {
        done();
      });
    });

    it.skip('should expose `err`:', function (done) {
      app.create('post', { isRenderable: true }, [
        function (patterns, next) {
          next(new Error('Something went wrong'));
        }
      ], function (err, result) {
        if (!err) done('Expected an error');
      });

      app.post('test/fixtures/*.md', function (err) {
        if (err) done();
      });
    });

    it.skip('should catch `err`:', function (done) {
      app.create('post', { isRenderable: true }, [
        function (patterns, next) {
          throw new Error('Something went wrong');
        }
      ], function (err, result) {
        if (!err) done('Expected an error');
      });

      app.post('test/fixtures/*.md', function (err) {
        if (err) done();
      });
    });

    it('should add functions on individual templates to the `subtype` loader stack:', function () {
      var options = {};
      app.create('post', { isRenderable: true }, [
        function (args) {
          var patterns = args[0];
          return globber(patterns, options);
        }
      ]);

      app.posts('test/fixtures/*.md', {a: 'b'});
      app.views.posts.should.have.property('md.md');
    });

    it('should use custom loaders in the load function:', function () {
      var options = {};
      app.loader('test-post', function (templates) {
        templates['added'] = { content: 'This was added' };
        return templates;
      });

      app.create('post', { isRenderable: true }, function (patterns) {
        return globber(patterns, options);
      });
      app.posts('test/fixtures/*.md', ['test-post']);
      app.views.posts.should.have.property('md.md');
      app.views.posts.should.have.property('added');
    });

    it('should use custom async loaders', function (done) {
      var options = {};
      app.create('post', { isRenderable: true, load: 'async' }, function (patterns, opts, next) {
        next(null, globber(patterns, options));
      });

      app.posts('test/fixtures/*.md', function (err, posts) {
        app.views.posts.should.have.property('md.md');
        done();
      });
    });

    it('should use custom promise loaders', function (done) {
      var Promise = require('bluebird');
      var options = {};
      app.create('post', { isRenderable: true, load: 'promise' }, Promise.method(function (patterns) {
        return globber(patterns, options);
      }));

      var promise = app.posts('test/fixtures/*.md');
      promise.then(function (posts) {
          app.views.posts.should.have.property('md.md');
          done();
        });
    });

    it('should use custom stream loaders', function (done) {
      var es = require('event-stream');
      var options = {};
      app.create('post', { isRenderable: true, load: 'stream' }, es.through(function (patterns) {
        this.emit('data', globber(patterns, options));
      }));

      app.posts('test/fixtures/*.md')
        .on('data', function (posts) {
          app.views.posts.should.have.property('md.md');
          done();
        });
    });
  });
});
