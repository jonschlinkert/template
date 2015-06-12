/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var _ = require('lodash');
var fs = require('fs');
var glob = require('glob');
var File = require('vinyl');
var Template = require('./app');
var globber = require('./lib/globber');
var through = require('through2');
var template;

describe.skip('template loaders', function () {
  beforeEach(function () {
    template = new Template();
    template.engine('md', require('engine-lodash'));
  });

  describe('when a custom loader stack is set:', function () {
    it('should allow custom loader stack to be used:', function () {
      var options = {};
      template.create('post', { viewType: 'renderable' },
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
      template.create('post', { viewType: 'renderable' }, function (patterns, opts) {
        return globber(patterns, opts);
      });
      template.post('test/fixtures/*.md');
      template.views.posts.should.have.property('md.md');
    });

    it('should load templates from files using a custom function:', function () {
      var options = {};
      template.create('post', { viewType: 'renderable' },
        function (patterns) {
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
      template.create('post', { viewType: 'renderable' },
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
      template.create('post', { viewType: 'renderable' }, [
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
      template.create('post', { viewType: 'renderable' }, [
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
      template.create('post', { viewType: 'renderable' }, [
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

      template.create('post', { viewType: 'renderable' }, function (patterns) {
        return globber(patterns, options);
      });
      template.posts('test/fixtures/*.md', ['test-post']);
      template.views.posts.should.have.property('md.md');
      template.views.posts.should.have.property('added');
    });

    it.skip('should use custom async loaders', function (done) {
      var options = {};
      template.create('post', { viewType: 'renderable', loaderType: 'async' }, function (patterns, opts, next) {
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

      template.create('post', { viewType: 'renderable', loaderType: 'promise' }, Promise.method(function (patterns) {
        return globber(patterns, options);
      }));

      template.posts('test/fixtures/*.md')
        .then(function (posts) {
          template.views.posts.should.have.property('md.md');
          done();
        });
    });

    it('should use custom stream loaders', function (done) {
      var options = {};

      template.loaderStream('glob', through.obj(function (pattern, enc, cb) {
        var stream = this;
        glob(pattern, function (err, files) {
          if (err) return cb(err);
          stream.push(files);
          return cb();
        });
      }));

      template.loaderStream('toVinyl', ['glob'], through.obj(function(files, enc, cb) {
        var stream = this;
        files.forEach(function (fp) {
          stream.push(new File({
            path: fp,
            contents: fs.readFileSync(fp)
          }));
        });
        return cb();
      }));

      template.loaderStream('plugin', through.obj(function plugin(file, enc, cb) {
        var str = file.contents.toString();
        file.contents = new Buffer(str.toLowerCase());
        this.push(file);
        return cb();
      }));

      template.create('post', { viewType: 'renderable', loaderType: 'stream' });

      template.posts('test/fixtures/*.txt', ['toVinyl', 'plugin'])
        .on('data', function (file) {
          file.content = file.contents.toString();
          console.log(file.content)
          file.data = file.data || {};
          template.views.pages[file.path] = file;
        })
        .pipe(through.obj(function(file, enc, cb) {
          this.push(file);
          return cb();
        }, function () {
          done()
        }))
        .on('error', console.error)
        .on('end', done);
    });
  });
});
