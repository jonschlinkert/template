/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var _ = require('lodash');
var Template = require('..');
var globber = require('./lib/globber');
var template;

describe('engine locals', function () {

  beforeEach(function () {
    template = new Template();
  });

  describe('when a custom loader function is set:', function () {
    it('should load using the custom loader', function () {
      template.create('npm', { loadFn: require('./lib/load-npm') });

      template.npm(__dirname + '/fixtures/loaders/npm-load.json');
      template.npm(__dirname + '/fixtures/loaders/npm-load.js');
      template.npm(__dirname + '/fixtures/loaders/npm-load.css');

      template.cache.npms.should.have.properties(['npm-load.js', 'npm-load.json', 'npm-load.css']);
    });
  });

  describe('when a custom loader stack is set:', function () {
    it('should allow custom loader stack to be used:', function (done) {
      var options = {};
      template.create('post', { isRenderable: true }, [
        function (patterns, next) {
          next(null, globber(patterns, options));
        }
      ]);
      template.posts(__dirname + '/fixtures/layouts/matter/*.md', function () {
        template.cache.posts.should.have.properties(['a.md', 'b.md', 'c.md', 'd.md']);
        done();
      });
    });

    it('should load templates from files using a custom function:', function (done) {
      template.create('post', { isRenderable: true }, [
        function (patterns, opts, next) {
          next(null, globber(patterns, opts));
        }
      ]);

      template.post('test/fixtures/*.md', {}, function () {
        template.cache.posts.should.have.property('md.md');
        done();
      });
    });

    it('should load templates from files using a custom function:', function (done) {
      var options = {};
      template.create('post', { isRenderable: true }, [
        function (patterns, next) {
          next(null, globber(patterns, options));
        },
        function (template, next) {
          _.transform(template, function (acc, value, key) {
            acc[key] = JSON.parse(value.content)[key];
          });
          next(null, template);
        }
      ]);
      template.post('test/fixtures/loaders/npm-load.json', function () {
        template.cache.posts.should.have.property('npm-load.json');
        done();
      });
    });

    it('should expose `err`:', function (done) {
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

    it('should add functions on individual templates to the `subtype` loader stack:', function (done) {
      var options = {};
      template.create('post', { isRenderable: true }, [
        function (patterns, value, next) {
          next(null, globber(patterns, options));
        }
      ]);

      template.posts('test/fixtures/*.md', {a: 'b'}, [
        function (files, next) {
          files.should.have.property('md.md');
          next(null, files);
        }
      ], function (err) {
        if (err) return done(err);
        template.cache.posts.should.have.property('md.md');
        done();
      });
    });

  });

  describe('when a custom loader function is set:', function () {
    it.skip('should load using the custom loader', function () {
      // template.create('page', { isRenderable: true }, [
      //   function (patterns, cwd, options, next) {
      //     var files = glob.sync(patterns, options);
      //     if (files.length === 0) {
      //       return next(null, null);
      //     }

      //     var res = _.reduce(files, function(acc, fp) {
      //       acc[fp] = {content: fs.readFileSync(fp, 'utf8'), path: fp};
      //       return acc;
      //     }, {}, this);

      //     next(null, res);
      //   },
      //   function (file, next) {
      //     // do stuff
      //     next(null, file);
      //   }
      // ], function (err, result) {
      //    // result now equals 'done'
      // });

      // template.pages('foo/*.md' [
      //   function (file, next) {
      //     // do stuff wit file
      //   }
      // ]);
    });
  });
});
