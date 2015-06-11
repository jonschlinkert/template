/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var fs = require('fs');
var async = require('async');
var path = require('path');
var glob = require('glob');
var File = require('vinyl');
var through = require('through2');
var Template = require('../');
var template;

describe('template loaders', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('sync:', function () {
    it('should use an array of functions:', function () {
      var options = {};
      template.create('post', { viewType: 'renderable' }, [
        function (patterns) {
          return glob.sync(patterns, options);
        },
        function (files) {
          return files.reduce(function (acc, fp) {
            acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
            return acc;
          }, {});
        }
      ]);

      template.posts('test/fixtures/*.txt', {a: 'b'});
      template.views.posts.should.have.property('test/fixtures/a.txt');
    });

    it('should use custom loaders in the load function:', function () {
      var opts = { viewType: 'renderable' };
      template.create('post', opts, function (patterns) {
        return glob.sync(patterns);
      });

      template.loader('toTemplate', function (files) {
        return files.reduce(function (acc, fp) {
          acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
          return acc;
        }, {});
      });
      template.posts('test/fixtures/*.txt', ['toTemplate']);
      template.views.posts.should.have.property('test/fixtures/a.txt');
    });
  });

  describe('sync:', function () {
    it('should catch `err`:', function (done) {
      template.create('post', { viewType: 'renderable', loaderType: 'async' }, [
        function () {
          throw new Error('Something went wrong');
        }
      ]);

      template.post('test/fixtures/*.md', function (err) {
        err.should.be.an.object;
        err.message.should.equal('Something went wrong');
        done();
      });
    });

    it('should use custom async loaders', function (done) {
      var options = { viewType: 'renderable', loaderType: 'async' };

      template.create('post', options, function glob_(pattern, opts, next) {
        if (typeof opts === 'function') {
          next = opts;
          opts = {};
        }
        glob(pattern, function (err, files) {
          if (err) return next(err);
          next(null, files);
        });
      });

      template.loader('toTemplate', {type: 'async'}, function(files, next) {
        async.reduce(files, {}, function (acc, fp, cb) {
          acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
          cb(null, acc);
        }, next);
      });

      template.posts('test/fixtures/*.txt', ['toTemplate'], function (posts, next) {
        next(null, posts);
      }, function doneFn(err) {
        if (err) return done(err);
        template.views.posts.should.have.property('test/fixtures/a.txt');
        done();
      });
    });
  });

  describe('promise', function () {
    it('should use custom promise loaders', function (done) {
      var Promise = require('bluebird');
      var options = { viewType: 'renderable', loaderType: 'promise' };

      template.create('post', options, Promise.method(function (patterns, opts) {
        return glob.sync(patterns, opts);
      }));

      template.loader('toTemplate', {type: 'promise'}, Promise.method(function(files) {
        return files.reduce(function (acc, fp) {
          acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
          return acc;
        }, {});
      }));

      template.loader('data', {type: 'promise'}, Promise.method(function(files) {
        for (var key in files) {
          if (files.hasOwnProperty(key)) {
            files[key].data = {title: path.basename(key, path.extname(key))};
          }
        }
        return files;
      }));

      template.posts('test/fixtures/*.txt', ['toTemplate', 'data'])
        .then(function (posts) {
          posts.should.have.property('test/fixtures/a.txt');
          posts.should.have.property('test/fixtures/b.txt');
          posts.should.have.property('test/fixtures/c.txt');
          template.views.posts.should.have.property('test/fixtures/a.txt');
          done();
        });
    });
  });

  describe('stream', function () {
    it('should use custom stream loaders', function (done) {

      template.loader('glob', {type: 'stream'}, function() {
        return through.obj(function (pattern, enc, cb) {
          var stream = this;
          glob(pattern, function (err, files) {
            if (err) return cb(err);
            stream.push(files);
            return cb();
          });
        });
      });

      template.loader('toVinyl', {type: 'stream'}, ['glob'], through.obj(function toVinyl(files, enc, cb) {
        var stream = this;
        files.forEach(function (fp) {
          stream.push(new File({
            path: fp,
            contents: fs.readFileSync(fp)
          }));
        });
        return cb();
      }));

      template.loader('plugin', {type: 'stream'}, through.obj(function plugin(file, enc, cb) {
        var str = file.contents.toString();
        file.contents = new Buffer(str.toLowerCase());
        this.push(file);
        return cb();
      }));

      template.create('post', { viewType: 'renderable', loaderType: 'stream' });

      template.posts('test/fixtures/*.txt', ['toVinyl', 'plugin'])
        .on('error', console.error)
        .pipe(through.obj(function(file, enc, cb) {
          this.push(file);
          return cb();
        }, function () {
          done();
        }))
        .on('error', console.error)
        .on('end', done);
    });
  });
});
