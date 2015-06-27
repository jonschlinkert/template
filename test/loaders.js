'use strict';

var fs = require('fs');
var async = require('async');
var path = require('path');
var glob = require('globby');
var assert = require('assert');
var should = require('should');
var through = require('through2');
var File = require('vinyl');
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

  describe.skip('when a custom loader stack is set:', function () {
    it('should allow custom loader stack to be used:', function () {
      var options = {};
      app.create('post', { viewType: 'renderable' },
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
      app.create('post', { viewType: 'renderable' }, function (patterns, opts) {
        return globber(patterns, opts);
      });
      app.post('test/fixtures/*.md');
      app.views.posts.should.have.property('md.md');
    });

    it('should load templates from files using a custom function:', function () {
      var options = {};
      app.create('post', { viewType: 'renderable' },
        function (patterns) {
          return globber(patterns, options);
        },
        function (template) {
          _.transform(template, function (acc, value, key) {
            acc[key] = JSON.parse(value.content)[key];
          });
          return template;
        });
      app.post('test/fixtures/loaders/npm-load.json');
      app.views.posts.should.have.property('npm-load.json');
    });

    it('should modify data:', function (done) {
      var options = {};
      app.data('test/fixtures/data/*.json');
      app.create('post', { viewType: 'renderable' },
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
      app.create('post', { viewType: 'renderable' }, [
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
      app.create('post', { viewType: 'renderable' }, [
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
      app.create('post', { viewType: 'renderable' }, [
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

      app.create('post', { viewType: 'renderable' }, function (patterns) {
        return globber(patterns, options);
      });
      app.posts('test/fixtures/*.md', ['test-post']);
      app.views.posts.should.have.property('md.md');
      app.views.posts.should.have.property('added');
    });

    it('should use custom async loaders', function (done) {
      var options = {};
      app.create('post', { viewType: 'renderable', loaderType: 'async' }, function (patterns, opts, next) {
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
      app.create('post', { viewType: 'renderable', loaderType: 'promise' }, Promise.method(function (patterns) {
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
      app.create('post', { viewType: 'renderable', loaderType: 'stream' }, es.through(function (patterns) {
        this.emit('data', globber(patterns, options));
      }));

      app.posts('test/fixtures/*.md')
        .on('data', function (posts) {
          app.views.posts.should.have.property('md.md');
          done();
        });
    });
  });

  describe.skip('errors:', function () {
    beforeEach(function () {
      app = new App();
    });

    it('create should throw an error when args are invalid:', function () {
      (function () {
        app.create();
      }).should.throw('Template#create: expects singular to be a string');
    });
  });

  describe.skip('sync:', function () {
    beforeEach(function () {
      app = new App();
    });

    describe('.loader():', function () {
      it('should register sync loaders', function () {
        app.loader('a', function () {});
        app.loader('b', function () {});
        app.loader('c', function () {});
        app.loaders.sync.should.have.properties(['a', 'b', 'c']);
      });
    });

    describe('.create():', function () {
      it('should use a loader function defined on the create method:', function () {
        app.create('post', { viewType: 'renderable' }, function post(patterns) {
          var files = glob.sync(patterns);
          return files.reduce(function (acc, fp) {
            acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
            return acc;
          }, {});
        });

        app.posts('test/fixtures/*.txt');
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });

      it('should use a combination of loaders defined on create and the collection loader:', function () {
        app.create('post', { viewType: 'renderable' }, function post(patterns) {
          return glob.sync(patterns);
        });

        app.loader('abc', function abc(files) {
          return files;
        });

        app.loader('toTemplate', ['abc'], function toTemplate(files) {
          return files.reduce(function (acc, fp) {
            acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
            return acc;
          }, {});
        });
        app.posts('test/fixtures/*.txt', ['toTemplate']);
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });

      it('should use an array of registered loaders:', function () {
        app.loader('first', function (name) {
          var file = {};
          file[name] = {path: name, content: 'this is content...'};
          return file;
        });
        app.loader('abc', function (files) {
          files.abc = {content: 'this is abc...'};
          return files;
        });
        app.loader('xyz', function (files) {
          files.xyz = {content: 'this is xyz...'};
          return files;
        });
        // loaders are on passed to .create
        app.create('posts', ['first', 'abc', 'xyz']);
        app.posts('foo');
        app.views.posts.should.have.property('foo');
        app.views.posts.should.have.property('abc');
        app.views.posts.should.have.property('xyz');
        app.views.posts.foo.content.should.equal('this is content...');
      });

      it('should add the values to views:', function () {
        app.loader('a', function (val) {
          val = val + 'a';
          return val;
        });
        app.loader('b', function (val) {
          val = val + 'b';
          return val;
        });
        app.loader('c', function (val) {
          val = val + 'c';
          return val;
        });
        app.create('posts');
        app.posts('-', ['a', 'b', 'c'], function (val) {
          return {foo: {content: val}};
        });
        app.views.posts.should.have.property('foo');
        app.views.posts.foo.content.should.equal('-abc');
      });

      it('should use an array of functions:', function () {
        var options = {};
        app.create('post', { viewType: 'renderable' }, [
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

        app.posts('test/fixtures/*.txt', {a: 'b'});
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });

      it('should use a list of functions:', function () {
        var options = {};
        app.create('post', { viewType: 'renderable' },
          function (patterns) {
            return glob.sync(patterns, options);
          },
          function (files) {
            return files.reduce(function (acc, fp) {
              acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
              return acc;
            }, {});
        });

        app.posts('test/fixtures/*.txt', {a: 'b'});
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });

      it('should use functions on create and the collection:', function () {
        var options = {};
        app.create('post', { viewType: 'renderable' }, function (patterns) {
          return glob.sync(patterns, options);
        });

        app.posts('test/fixtures/*.txt', {a: 'b'}, function (files) {
          return files.reduce(function (acc, fp) {
            acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
            return acc;
          }, {});
        });
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });
    });

    describe('collection:', function () {
      it('should use an array of registered loaders:', function () {
        app.loader('first', function first(name) {
          var file = {};
          file[name] = {path: name, content: 'this is content...'};
          return file;
        });
        app.loader('abc', function abc(files) {
          files.abc = {content: 'this is abc...'};
          return files;
        });
        app.loader('xyz', function xyz(files) {
          files.xyz = {content: 'this is xyz...'};
          return files;
        });
        app.create('posts');
        // loaders are on the collection
        app.posts('foo', ['first', 'abc', 'xyz']);
        // console.log(app.views.posts)
        app.views.posts.should.have.property('foo');
        app.views.posts.should.have.property('abc');
        app.views.posts.should.have.property('xyz');
        app.views.posts.foo.content.should.equal('this is content...');
      });

      it('should use an array of functions:', function () {
        var options = {};
        app.create('post', { viewType: 'renderable' });

        app.posts('test/fixtures/*.txt', {a: 'b'}, [
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
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });

      it('should use a list of functions:', function () {
        var options = {};
        app.create('post', { viewType: 'renderable' });

        app.posts('test/fixtures/*.txt', {a: 'b'},
          function (patterns) {
            return glob.sync(patterns, options);
          },
          function (files) {
            return files.reduce(function (acc, fp) {
              acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
              return acc;
            }, {});
        });
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });
    });

    describe('.iterator():', function () {
      it('should register a sync iterator', function () {
        app.iterator('sync', function () {});
        app.iterator('async', function () {});
        app.iterators.should.have.properties(['sync', 'async']);
      });
    });
  });

  describe.skip('async:', function () {
    beforeEach(function () {
      app = new App();
    });

    describe('.create():', function () {
      it('should use an array of registered loaders:', function (done) {
        var opts = { loaderType: 'async' };

        // register the loaders
        app.loader('first', opts, function first(name, opts, next) {
          if (typeof opts === 'function') {
            next = opts;
            opts = {};
          }
          var file = {};
          file[name] = {path: name, content: 'this is content...'};
          next(null, file);
        });

        app.loader('abc', opts, function abc(files, next) {
          files.abc = {content: 'this is abc...'};
          next(null, files);
        });

        app.loader('xyz', opts, function xyz(files, next) {
          files.xyz = {content: 'this is xyz...'};
          next(null, files);
        });

        // pass the array of loaders to .create
        app.create('posts', opts, ['first', 'abc', 'xyz']);
        app.posts('foo', opts, function foo(files, next) {
          next(null, files);
        }, done);
      });

      it.skip('should use an array of registered loaders passed to a collection:', function (done) {
        var opts = { loaderType: 'async' };

        // register the loaders
        app.loader('first', opts, function (name, opts, next) {
          if (typeof opts === 'function') {
            next = opts;
            opts = {};
          }
          var file = {};
          file[name] = {path: name, content: 'this is content...'};
          next(null, file);
        });
        app.loader('abc', opts, function (files, next) {
          files.abc = {content: 'this is abc...'};
          next(null, files);
        });
        app.loader('xyz', opts, function (files, next) {
          files.xyz = {content: 'this is xyz...'};
          next(null, files);
        });

        app.create('posts', opts);
        // pass the array of loaders to the collection loader
        app.posts('foo', opts, ['first', 'abc', 'xyz'], function (files, next) {
          next(null, files);
        }, function (err) {
          if (err) return done(err);
          app.views.posts.should.have.property('foo');
          app.views.posts.should.have.property('abc');
          app.views.posts.should.have.property('xyz');
          app.views.posts.foo.content.should.equal('this is content...');
          done();
        });
      });

      it.skip('should use custom async loaders', function (done) {
        var opts = { viewType: 'renderable', loaderType: 'async' };

        app.create('post', opts, function (views, options) {
          return function create(pattern, next) {
            glob(pattern, function (err, files) {
              if (err) return next(err);
              next(null, files);
            });
          };
        });

        app.loader('toTemplate', opts, function (views, options) {
          return function toTemplate(files, cb) {
            async.reduce(files, views, function (acc, fp, next) {
              acc.set(fp, {path: fp, content: fs.readFileSync(fp, 'utf8')});
              return next(null, acc);
            }, cb);
          };
        });

        app.posts('test/fixtures/*.txt', ['toTemplate'], function (views, options) {
          return function posts(posts, next) {
            next(null, posts);
          }, function doneFn(err) {
            if (err) return done(err);
            // app.views.posts.should.have.property('test/fixtures/a.txt');
            done();
          };
        });
      });

      it('should use a loader function defined on the create method:', function (done) {
        var opts = { viewType: 'renderable', loaderType: 'async' };

        app.create('file', opts, glob);
        app.loader('toTemplate', opts, function (files, next) {
          async.reduce(files, {}, function (acc, fp, cb) {
            acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
            cb(null, acc);
          }, next);
        });

        app.files('test/fixtures/*.txt', ['toTemplate'], function (files, next) {
          next(null, files);
        }, function doneFn(err) {
          if (err) return done(err);
          app.views.files.should.have.property('test/fixtures/a.txt');
          done();
        });
      });
    });
  });

  describe('promise:', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should use custom promise loaders', function (done) {
      var Promise = require('bluebird');
      var options = { viewType: 'renderable', loaderType: 'promise' };

      app.create('post', options, function (views, options) {
        return Promise.method(function (patterns, opts) {
          return glob.sync(patterns, opts);
        });
      });

      app.loader('toTemplate', {loaderType: 'promise'}, function (views, options) {
        return Promise.method(function(files) {
          return files.reduce(function (acc, fp) {
            acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
            return acc;
          }, {});
        });
      });

      app.loader('data', {loaderType: 'promise'}, function (views, options) {
        return Promise.method(function(res) {
          for (var key in res) {
            if (res.hasOwnProperty(key)) {
              res[key].data = {title: path.basename(key, path.extname(key))};
              views.set(key, res[key]);
            }
          }
          return res;
        });
      });

      app.posts('test/fixtures/*.txt', ['toTemplate', 'data'])
        .then(function (posts) {
          posts.should.have.property('test/fixtures/a.txt');
          posts.should.have.property('test/fixtures/b.txt');
          posts.should.have.property('test/fixtures/c.txt');
          app.views.posts.should.have.property('test/fixtures/a.txt');
          done();
        });
    });
  });

  describe('stream:', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should use custom stream loaders', function (done) {
      var opts = {loaderType: 'stream'};

      app.loader('glob', opts, function(views, opts) {
        return through.obj(function (pattern, enc, next) {
          var stream = this;

          glob(pattern, function (err, files) {
            if (err) return next(err);

            files.forEach(function (fp) {
              var buffer = fs.readFileSync(fp);

              var view = {path: fp, content: buffer.toString()};
              views.set(fp, view);
              view.contents = buffer;

              var file = new File(view);
              stream.push(file);
            });

            return next();
          });
        });
      });

      app.create('post', {
        viewType: 'renderable',
        loaderType: 'stream'
      });

      app.posts('test/fixtures/*.txt', ['glob'])
        .pipe(through.obj(function(file, enc, next) {
          console.log(app.views.posts)
          this.push(file);
          return next();
        }, function () {
          done();
        }))
        .on('error', console.error)
        .on('end', done);
    });
  });
});
