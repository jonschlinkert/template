'use strict';

var fs = require('fs');
var async = require('async');
var forIn = require('for-in');
var path = require('path');
var glob = require('globby');
var assert = require('assert');
var should = require('should');
var globber = require('./support/globber');
var Promise = require('bluebird');
var es = require('event-stream');
var through = require('through2');
var File = require('vinyl');
var App = require('..');
var app;

describe('loaders', function () {
  describe('register sync', function () {
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

  describe('register async', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should register an async iterator:', function () {
      app.iterator('async', function () {});
      app.loaders.async.should.have.property('iterator');
      app.loaders.async.iterator.should.have.property('fn');
      assert.equal(typeof app.loaders.async.iterator.fn, 'function');
    });

    it('should register an async loader:', function () {
      app.iterator('async', function () {});
      app.loader('a', {loaderType: 'async'}, function () {});
      app.loaders.should.have.property('async');
      app.loaders.async.should.have.property('a');
    });
  });

  describe('register promise', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should register a promise iterator:', function () {
      app.iterator('promise', function () {});
      app.loaders.promise.should.have.property('iterator');
      app.loaders.promise.iterator.should.have.property('fn');
      assert.equal(typeof app.loaders.promise.iterator.fn, 'function');
    });

    it('should register a loader:', function () {
      app.iterator('promise', { loaderType: 'promise' }, function () {});
      app.loader('a', {loaderType: 'promise'}, function () {});
      app.loaders.should.have.property('promise');
      app.loaders.promise.should.have.property('a');
    });
  });

  describe('register stream', function () {
    beforeEach(function () {
      app = new App();
    });

    it('should register a stream iterator:', function () {
      app.iterator('stream', function () {});
      app.loaders.stream.should.have.property('iterator');
      app.loaders.stream.iterator.should.have.property('fn');
      assert.equal(typeof app.loaders.stream.iterator.fn, 'function');
    });

    it('should register a loader:', function () {
      app.iterator('stream', { loaderType: 'stream' }, function () {});
      app.loader('a', {loaderType: 'stream'}, function () {});
      app.loaders.should.have.property('stream');
      app.loaders.stream.should.have.property('a');
    });
  });

  describe('loader stacks:', function () {
    beforeEach(function () {
      app = new App();
      app.engine('md', require('engine-lodash'));
    });

    it('should support multiple custom loaders:', function () {
      var options = {};
      app.loader('foo', function (views, options) {
        return function (patterns, opts) {
          return glob.sync(patterns, opts);
        };
      });

      app.loader('bar', ['foo'], function (views, options) {
        return function (files) {
          return files.reduce(function (acc, fp) {
            return acc.set(fp, {path: fp, content: fs.readFileSync(fp, 'utf8')});
          }, views);
        };
      });

      app.create('post', ['bar'], {
        renameKey: function (key) {
          return path.basename(key);
        }
      });

      app.posts('test/fixtures/*.md', {});
      app.views.posts.should.have.properties(['a.md', 'b.md', 'c.md']);
    });

    it('should support a list of functions as arguments:', function () {
      app.create('post',
        function (views, opts) {
          return function (patterns) {
            return globber(patterns, opts);
          };
        },
        function (views, opts) {
          return function (res) {
            for (var key in res) {
              if (res.hasOwnProperty(key)) {
                views.set(key, res[key]);
              }
            }
            return views;
          }
        });
      app.post('test/fixtures/loaders/npm-load.json');
      app.views.posts.should.have.property('npm-load.json');
    });

    it('should modify data:', function (done) {
      app.data('test/fixtures/data/*.json');
      app.create('post',
        function (views, opts) {
          return function (patterns) {
            return globber(patterns, opts);
          };
        },
        function (views, opts) {
          return function (res) {
            for (var key in res) {
              if (res.hasOwnProperty(key)) {
                views.set(key, res[key]);
              }
            }
            return views;
          }
        });

      app.post('test/fixtures/*.md');
      app.views.posts.should.have.property('a.md');
      
      app.render('a.md', function (err, res) {
        if (err) return done(err);
        done();
      });
    });

    it('should expose `err`:', function (done) {
      app.create('post', {loaderType: 'async'}, function (views, opts) {
        return function (patterns, next) {
          next(new Error('Something went wrong!'));
        }
      });

      app.post('test/fixtures/*.md', function (err) {
        err.message.should.equal('Something went wrong!');
        if (err) done();
      });
    });

    it('should use custom async loaders', function (done) {
      var options = { viewType: 'renderable', loaderType: 'async' };
      app.create('post', { loaderType: 'async' }, function (views, options) {
        return function (pattern, opts, next) {
          var args = [].slice.call(arguments);
          next = args.pop();
          try {
            glob(pattern, function (err, files) {
              if (err) return next(err);

              next(null, files.reduce(function (acc, fp) {
                acc.set(fp, {path: fp, content: fp});
                return acc;
              }, views));
            });
          } catch (err) {
            next(err);
          }
        };
      });

      app.posts('test/fixtures/*.md', function (err, res) {
        if (err) return done(err);

        res.should.have.property('test/fixtures/a.md');
        done();
      });
    });

    it('should use custom promise loaders', function (done) {
      var options = { viewType: 'renderable', loaderType: 'promise' };
      app.create('post', options, function (views, opts) {
        return Promise.method(function (patterns) {
          return globber(patterns);
        });
      });

      app.posts('test/fixtures/*.md')
        .then(function (posts) {
          posts.should.have.property('a.md');
          done();
        });
    });

    it('should use custom stream loaders', function (done) {
      var options = { viewType: 'renderable', loaderType: 'stream' };
      app.create('post', options, function(views, opts) {
        return es.through(function (patterns) {
          this.emit('data', globber(patterns, options));
        });
      });

      app.posts('test/fixtures/*.md')
        .on('data', function (posts) {
          posts.should.have.property('a.md');
          done();
        });
    });
  });

  describe('sync:', function () {
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
        app.create('post', function (views, opts) {
          return function post(patterns) {
            var files = glob.sync(patterns);
            return files.reduce(function (acc, fp) {
              acc.set(fp, {path: fp, content: fs.readFileSync(fp, 'utf8')});
              return acc;
            }, views);
          };
        });

        app.posts('test/fixtures/*.txt');
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });

      it('should use a combination of loaders defined on create and the collection loader:', function () {
        app.create('post', function (views, opts) {
          return function post(patterns) {
            return glob.sync(patterns);
          };
        });

        app.loader('abc', function (views, opts) {
          return function abc(files) {
            return files;
          };
        });

        app.loader('toTemplate', ['abc'], function (views, opts) {
          return function (files) {
            return files.reduce(function (acc, fp) {
              acc.set(fp, {path: fp, content: fs.readFileSync(fp, 'utf8')});
              return acc;
            }, views);
          };
        });

        app.posts('test/fixtures/*.txt', ['toTemplate']);
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });

      it('should use an array of registered loaders:', function () {
        app.loader('first', function (views, opts) {
          return function (name) {
            var file = {};
            file[name] = {path: name, content: 'this is content...'};
            return file;
          };
        });
        app.loader('abc', function (views, opts) {
          return function (files) {
            files.abc = {path: '', content: 'this is abc...'};
            return files;
          };
        });
        app.loader('xyz', function (views, opts) {
          return function (files) {
            files.xyz = {path: '', content: 'this is xyz...'};
            views.visit('set', files);
            return files;
          };
        });
        // loaders are on passed to .create
        app.create('posts', ['first', 'abc', 'xyz']);
        app.posts('foo');
        app.views.posts.should.have.property('foo');
        app.views.posts.should.have.property('abc');
        app.views.posts.should.have.property('xyz');
        app.views.posts.foo.content.should.equal('this is content...');
      });

      it('should use an array of functions:', function () {
        var options = {};
        app.create('post', [
          function (views, opts) {
            return function (patterns) {
              return glob.sync(patterns);
            }
          },
          function (views, opts) {
            return function (files) {
              return files.reduce(function (acc, fp) {
                acc.set(fp, {path: fp, content: fs.readFileSync(fp, 'utf8')});
                return acc;
              }, views);
            }
          }
        ]);

        app.posts('test/fixtures/*.txt', {a: 'b'});
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });

      it('should use a list of functions:', function () {
        var options = {};
        app.create('post',
          function (views, opts) {
            return function (patterns) {
              return glob.sync(patterns);
            }
          },
          function (views, opts) {
            return function (files) {
              return files.reduce(function (acc, fp) {
                acc.set(fp, {path: fp, content: fs.readFileSync(fp, 'utf8')});
                return acc;
              }, views);
            }
          });

        app.posts('test/fixtures/*.txt', {a: 'b'});
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });

      it('should use functions on create and the collection:', function () {
        var options = {};
        app.create('post', function (views, opts) {
          return function (patterns) {
            return glob.sync(patterns);
          };
        });

        app.posts('test/fixtures/*.txt', {a: 'b'}, function (views, opts) {
          return function (files) {
            return files.reduce(function (acc, fp) {
              acc.set(fp, {path: fp, content: fs.readFileSync(fp, 'utf8')});
              return acc;
            }, views);
          };
        });
        app.views.posts.should.have.property('test/fixtures/a.txt');
      });
    });

  });

  describe('async:', function () {
    beforeEach(function () {
      app = new App();
    });

    describe('.create():', function () {
      it('should use an array of registered loaders:', function (done) {
        var opts = { loaderType: 'async' };

        // register the loaders
        app.loader('first', opts, function (views, opts) {
          return function first(name, opts, next) {
            if (typeof opts === 'function') {
              next = opts;
              opts = {};
            }
            var file = {};
            file[name] = {path: name, content: 'this is content...'};
            next(null, file);
          };
        });

        app.loader('abc', opts, function (views, opts) {
          return function abc(files, next) {
            files.abc = {content: 'this is abc...'};
            next(null, files);
          };
        });

        app.loader('xyz', opts, function (views, opts) {
          return function xyz(files, next) {
            files.xyz = {content: 'this is xyz...'};
            next(null, files);
          };
        });

        // pass the array of loaders to .create
        app.create('posts', opts, ['first', 'abc', 'xyz']);
        app.posts('foo', opts, function (views, opts) {
          return function foo(files, next) {
            next(null, files);
          };
        }, done);
      });

      it('should use an array of registered loaders passed to a collection:', function (done) {
        var opts = { loaderType: 'async' };

        // register the loaders
        app.loader('first', opts, function (views, opts) {
          return function (name, opts, next) {
            if (typeof opts === 'function') {
              next = opts;
              opts = {};
            }
            var file = {};
            file[name] = {path: name, content: 'this is content...'};
            next(null, file);
          };
        });
        app.loader('abc', opts, function (views, opts) {
          return function (files, next) {
            files.abc = {path: '', content: 'this is abc...'};
            next(null, files);
          };
        });
        app.loader('xyz', opts, function (views, opts) {
          return function (files, next) {
            files.xyz = {path: '', content: 'this is xyz...'};
            next(null, files);
          };
        });

        app.create('posts', opts);
        // pass the array of loaders to the collection loader
        app.posts('foo', opts, ['first', 'abc', 'xyz'], function (views, opts) {
          return function (files, next) {
            views.visit('set', files);
            next(null, files);
          }
        }, function (err) {
          if (err) return done(err);
          app.views.posts.should.have.property('foo');
          app.views.posts.should.have.property('abc');
          app.views.posts.should.have.property('xyz');
          app.views.posts.foo.content.should.equal('this is content...');
          done();
        });
      });

      it('should use custom async loaders', function (done) {
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

        app.posts('test/fixtures/*.txt', ['toTemplate'], function (err, posts) {
          posts.should.have.property('test/fixtures/a.txt');
          done();
        });
      });

      it('should use a loader function defined on the create method:', function (done) {
        var opts = { viewType: 'renderable', loaderType: 'async' };

        app.create('file', opts, function (views, opts) {
          return glob.bind(glob);
        });

        app.loader('toTemplate', opts, function (views, opts) {
          return function (files, cb) {
            async.reduce(files, views, function (acc, fp, next) {
              acc.set(fp, {path: fp, content: fs.readFileSync(fp, 'utf8')});
              next(null, acc);
            }, cb);
          }
        });

        app.files('test/fixtures/*.txt', ['toTemplate'], function (err, files) {
          files.should.have.property('test/fixtures/a.txt');
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

      app.create('post', {viewType: 'renderable', loaderType: 'stream'});
      app.posts('test/fixtures/*.txt', ['glob'])
        .pipe(through.obj(function(file, enc, next) {
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
