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

function toTemplateAsync(files, next) {
  async.reduce(files, {}, function (acc, fp, cb) {
    acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
    cb(null, acc);
  }, next);
}

describe('loaders', function () {
  describe('errors:', function () {
    beforeEach(function () {
      template = new Template();
    });

    it('create should throw an error when args are invalid:', function () {
      (function () {
        template.create();
      }).should.throw('Template#create: expects singular to be a string.');
    });

    it('loaderType should throw an error when args are invalid:', function () {
      (function () {
        template.loaderType();
      }).should.throw('Template#loaderType: expects type to be a string.');
    });

    it('loader should throw an error when args are invalid:', function () {
      (function () {
        template.loader();
      }).should.throw('Template#loader: expects name to be a string.');
    });

    it('buildStack should throw an error when args are invalid:', function () {
      (function () {
        template.buildStack();
      }).should.throw('Template#buildStack: expects type to be a string.');
    });
  });

  describe('sync:', function () {
    beforeEach(function () {
      template = new Template();
    });

    describe('.loader():', function () {
      it('should register sync loaders', function () {
        template.loader('a', function () {});
        template.loader('b', function () {});
        template.loader('c', function () {});
        template.loaders.sync.should.have.properties(['a', 'b', 'c']);
      });
    });

    describe('.create():', function () {
      it('should use a loader function defined on the create method:', function () {
        template.create('post', { viewType: 'renderable' }, function (patterns) {
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

      it('should use an array of registered loaders:', function () {
        template.loader('first', function (name) {
          var file = {};
          file[name] = {path: name, content: 'this is content...'};
          return file;
        });
        template.loader('abc', function (files) {
          files.abc = {content: 'this is abc...'}
          return files;
        });
        template.loader('xyz', function (files) {
          files.xyz = {content: 'this is xyz...'}
          return files;
        });
        // loaders are on passed to .create
        template.create('posts', ['first', 'abc', 'xyz']);
        template.posts('foo');
        template.views.posts.should.have.property('foo');
        template.views.posts.should.have.property('abc');
        template.views.posts.should.have.property('xyz');
        template.views.posts.foo.content.should.equal('this is content...');
      });

      it('should add the values to views:', function () {
        template.loader('a', function (val) {
          val = val + 'a';
          return val
        });
        template.loader('b', function (val) {
          val = val + 'b';
          return val
        });
        template.loader('c', function (val) {
          val = val + 'c';
          return val
        });
        template.create('posts')
        template.posts('-', ['a', 'b', 'c'], function (val) {
          return {foo: {content: val}};
        });
        template.views.posts.should.have.property('foo');
        template.views.posts.foo.content.should.equal('-abc');
      });

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

      it('should use a list of functions:', function () {
        var options = {};
        template.create('post', { viewType: 'renderable' },
          function (patterns) {
            return glob.sync(patterns, options);
          },
          function (files) {
            return files.reduce(function (acc, fp) {
              acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
              return acc;
            }, {});
        });

        template.posts('test/fixtures/*.txt', {a: 'b'});
        template.views.posts.should.have.property('test/fixtures/a.txt');
      });

      it('should use functions on create and the collection:', function () {
        var options = {};
        template.create('post', { viewType: 'renderable' }, function (patterns) {
          return glob.sync(patterns, options);
        });

        template.posts('test/fixtures/*.txt', {a: 'b'}, function (files) {
          return files.reduce(function (acc, fp) {
            acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
            return acc;
          }, {});
        });
        template.views.posts.should.have.property('test/fixtures/a.txt');
      });
    });

    describe('collection:', function () {
      it('should use an array of registered loaders:', function () {
        template.loader('first', function (name) {
          var file = {};
          file[name] = {path: name, content: 'this is content...'};
          return file;
        });
        template.loader('abc', function (files) {
          files.abc = {content: 'this is abc...'}
          return files;
        });
        template.loader('xyz', function (files) {
          files.xyz = {content: 'this is xyz...'}
          return files;
        });
        template.create('posts');
        // loaders are on the collection
        template.posts('foo', ['first', 'abc', 'xyz']);
        template.views.posts.should.have.property('foo');
        template.views.posts.should.have.property('abc');
        template.views.posts.should.have.property('xyz');
        template.views.posts.foo.content.should.equal('this is content...');
      });

      it('should use an array of functions:', function () {
        var options = {};
        template.create('post', { viewType: 'renderable' });

        template.posts('test/fixtures/*.txt', {a: 'b'}, [
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
        template.views.posts.should.have.property('test/fixtures/a.txt');
      });

      it('should use a list of functions:', function () {
        var options = {};
        template.create('post', { viewType: 'renderable' });

        template.posts('test/fixtures/*.txt', {a: 'b'},
          function (patterns) {
            return glob.sync(patterns, options);
          },
          function (files) {
            return files.reduce(function (acc, fp) {
              acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
              return acc;
            }, {});
        });
        template.views.posts.should.have.property('test/fixtures/a.txt');
      });
    });

    describe('.getLoaderInstance():', function () {
      it('should get sync loaders', function () {
        template.loader('a', function () {});
        template.loader('b', function () {});
        template.loader('c', function () {});
        var loaders = template.getLoaderInstance('sync');
        loaders.should.have.properties(['cache', 'iterator']);
        loaders.cache.should.have.properties(['a', 'b', 'c']);
      });

      it('should throw an error when args are invalid:', function () {
        (function () {
          template.getLoaderInstance();
        }).should.throw('Template#getLoaderInstance: expects a string or object.');
      });
    });

    describe('.iterator():', function () {
      it('should register a sync iterator', function () {
        template.iterator('sync', function () {});
        template.iterator('async', function () {});
        template.iterators.should.have.properties(['sync', 'async']);
      });
    });
  });

  describe('async:', function () {
    beforeEach(function () {
      template = new Template();
    });

    describe('.create():', function () {

      it('should use an array of registered loaders passed to create:', function (done) {
        var opts = { loaderType: 'async' };

        // register the loaders
        template.loader('first', opts, function (name, next) {
          var file = {};
          file[name] = {path: name, content: 'this is content...'};
          next(null, file);
        });
        template.loader('abc', opts, function (files, next) {
          files.abc = {content: 'this is abc...'}
          next(null, files);
        });
        template.loader('xyz', opts, function (files, next) {
          files.xyz = {content: 'this is xyz...'}
          next(null, files);
        });

        // pass the array of loaders to .create
        template.create('posts', opts, ['first', 'abc', 'xyz']);
        template.posts('foo', opts, function (files, next) {
          next(null, files);
        }, function (err) {
          if (err) return done(err);
          template.views.posts.should.have.property('foo');
          template.views.posts.should.have.property('abc');
          template.views.posts.should.have.property('xyz');
          template.views.posts.foo.content.should.equal('this is content...');
          done();
        });
      });

      it('should use an array of registered loaders passed to a collection:', function (done) {
        var opts = { loaderType: 'async' };

        // register the loaders
        template.loader('first', opts, function (name, next) {
          var file = {};
          file[name] = {path: name, content: 'this is content...'};
          next(null, file);
        });
        template.loader('abc', opts, function (files, next) {
          files.abc = {content: 'this is abc...'}
          next(null, files);
        });
        template.loader('xyz', opts, function (files, next) {
          files.xyz = {content: 'this is xyz...'}
          next(null, files);
        });

        template.create('posts', opts);
        // pass the array of loaders to the collection loader
        template.posts('foo', opts, ['first', 'abc', 'xyz'], function (files, next) {
          next(null, files);
        }, function (err) {
          if (err) return done(err);
          template.views.posts.should.have.property('foo');
          template.views.posts.should.have.property('abc');
          template.views.posts.should.have.property('xyz');
          template.views.posts.foo.content.should.equal('this is content...');
          done();
        });
      });

      it('should use custom async loaders', function (done) {
        var opts = { viewType: 'renderable', loaderType: 'async' };

        template.create('post', opts, glob);
        template.loader('toTemplate', opts, function (files, next) {
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

      it('should use a loader function defined on the create method:', function (done) {
        var opts = { viewType: 'renderable', loaderType: 'async' };

        template.create('file', opts, glob);
        template.loader('toTemplate', opts, function (files, next) {
          async.reduce(files, {}, function (acc, fp, cb) {
            acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
            cb(null, acc);
          }, next);
        });

        template.files('test/fixtures/*.txt', ['toTemplate'], function (files, next) {
          next(null, files);
        }, function doneFn(err) {
          if (err) return done(err);
          template.views.files.should.have.property('test/fixtures/a.txt');
          done();
        });
      });
    });
  });

  describe('promise:', function () {
    beforeEach(function () {
      template = new Template();
    });

    it('should use custom promise loaders', function (done) {
      var Promise = require('bluebird');
      var options = { viewType: 'renderable', loaderType: 'promise' };

      template.create('post', options, Promise.method(function (patterns, opts) {
        return glob.sync(patterns, opts);
      }));

      template.loader('toTemplate', {loaderType: 'promise'}, Promise.method(function(files) {
        return files.reduce(function (acc, fp) {
          acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')};
          return acc;
        }, {});
      }));

      template.loader('data', {loaderType: 'promise'}, Promise.method(function(files) {
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

  describe('stream:', function () {
    beforeEach(function () {
      template = new Template();
    });

    it('should use custom stream loaders', function (done) {

      template.loader('glob', {loaderType: 'stream'}, function() {
        return through.obj(function (pattern, enc, cb) {
          var stream = this;
          glob(pattern, function (err, files) {
            if (err) return cb(err);
            stream.push(files);
            return cb();
          });
        });
      });

      template.loader('toVinyl', {loaderType: 'stream'}, ['glob'], through.obj(function toVinyl(files, enc, cb) {
        var stream = this;
        files.forEach(function (fp) {
          stream.push(new File({
            path: fp,
            contents: fs.readFileSync(fp)
          }));
        });
        return cb();
      }));

      template.loader('plugin', {loaderType: 'stream'}, through.obj(function plugin(file, enc, cb) {
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
