/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var _ = require('lodash');
var Template = require('..');
var globber = require('./lib/globber');
var template;

describe('template loaders', function () {
  beforeEach(function () {
    template = new Template();
    template.engine('md', require('engine-lodash'));
  });

  describe('when a custom loader function is set:', function () {
    it('should load using the custom loader', function () {
      template.create('npm', { loadFn: require('./lib/load-npm') });

      template.npm(__dirname + '/fixtures/loaders/npm-load.json');
      template.npm(__dirname + '/fixtures/loaders/npm-load.js');
      template.npm(__dirname + '/fixtures/loaders/npm-load.css');

      template.views.npms.should.have.properties(['npm-load.js', 'npm-load.json', 'npm-load.css']);
    });
  });

  describe('when a custom loader stack is set:', function () {
    it('should allow custom loader stack to be used:', function () {
      var options = {};
      template.create('post', { isRenderable: true },
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
      template.posts(__dirname + '/fixtures/layouts/matter/*.md');
      template.views.posts.should.have.properties(['a.md', 'b.md', 'c.md', 'd.md']);
    });

    it('should load templates from files using a custom function:', function () {
      template.create('post', { isRenderable: true }, function (patterns, opts) {
        return globber(patterns, opts);
      });
      template.post('test/fixtures/*.md');
      template.views.posts.should.have.property('md.md');
    });

    it('should load templates from files using a custom function:', function () {
      var options = {};
      template.create('post', { isRenderable: true }, function (patterns) {
        return globber(patterns, options);
      },
      function (template) {
        _.transform(template, function (acc, value, key) {
          acc[key] = JSON.parse(value.content)[key];
        });
        return template
      });
      template.post('test/fixtures/loaders/npm-load.json');
      template.views.posts.should.have.property('npm-load.json');
    });

    it('should modify data:', function (done) {
      var options = {};
      template.data('test/fixtures/data/*.json');
      template.create('post', { isRenderable: true },
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

      template.post('test/fixtures/*.md');
      template.render('md.md', function (err, content) {
        done();
      });
    });

    it.skip('should expose `err`:', function (done) {
      template.create('post', { isRenderable: true }, [
        function (patterns, next) {
          next(new Error('Something went wrong'));
        }
      ], function (err, result) {
        if (!err) done('Expected an error');
      });

      template.post('test/fixtures/*.md', function (err) {
        if (err) done();
      });
    });

    it.skip('should catch `err`:', function (done) {
      template.create('post', { isRenderable: true }, [
        function (patterns, next) {
          throw new Error('Something went wrong');
        }
      ], function (err, result) {
        if (!err) done('Expected an error');
      });

      template.post('test/fixtures/*.md', function (err) {
        if (err) done();
      });
    });

    it('should add functions on individual templates to the `subtype` loader stack:', function () {
      var options = {};
      template.create('post', { isRenderable: true }, [
        function (args) {
          var patterns = args[0];
          return globber(patterns, options);
        }
      ]);

      template.posts('test/fixtures/*.md', {a: 'b'});
      template.views.posts.should.have.property('md.md');
    });

    it('should use custom loaders in the load function:', function () {
      var options = {};
      template.loader('test-post', function (templates) {
        templates['added'] = { content: 'This was added' };
        return templates;
      });

      template.create('post', { isRenderable: true }, function (patterns) {
        return globber(patterns, options);
      });
      template.posts('test/fixtures/*.md', ['test-post']);
      template.views.posts.should.have.property('md.md');
      template.views.posts.should.have.property('added');
    });

    it('should use custom async loaders', function (done) {
      var options = {};
      template.create('post', { isRenderable: true, load: 'async' }, function (patterns, opts, next) {
        next(null, globber(patterns, options));
      });

      template.posts('test/fixtures/*.md', function (err, posts) {
        template.views.posts.should.have.property('md.md');
        done();
      });
    });

    it('should use custom promise loaders', function (done) {
      var Promise = require('bluebird');
      var options = {};
      template.create('post', { isRenderable: true, load: 'promise' }, Promise.method(function (patterns) {
        return globber(patterns, options);
      }));

      var promise = template.posts('test/fixtures/*.md');
      promise.then(function (posts) {
          template.views.posts.should.have.property('md.md');
          done();
        });
    });

    it('should use custom stream loaders', function (done) {
      var es = require('event-stream');
      var options = {};
      template.create('post', { isRenderable: true, load: 'stream' }, es.through(function (patterns) {
        this.emit('data', globber(patterns, options));
      }));

      template.posts('test/fixtures/*.md')
        .on('data', function (posts) {
          template.views.posts.should.have.property('md.md');
          done();
        });
    });

  });
});
