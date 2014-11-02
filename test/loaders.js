/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var Template = require('..');
var template = new Template();

describe('engine locals', function () {
  beforeEach(function () {
    template = new Template();
    function globber(patterns, options) {
      var files = glob.sync(patterns, options);
      if (files.length === 0) {
        return next(null, null);
      }
      return _.reduce(files, function(acc, fp) {
        acc[fp] = {content: fs.readFileSync(fp, 'utf8'), path: fp};
        return acc;
      }, {}, this);
    }
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

  describe('when a custom loader function is set:', function () {
    it('should allow custom loader function to be used:', function () {
      template.create('post', { isRenderable: true }, [
        function (patterns, options, next) {
          next(null, globber(patterns, options));
        }
      ]);
    });

    it('should load templates from files using a custom function:', function () {
      template.create('post', { isRenderable: true }, [
        function (patterns, options, next) {
          next(null, globber(patterns, options));
        }
      ]);

      template.post('test/fixtures/*.md');

    });

    it('should load templates from files using a custom function:', function () {
      template.create('post', { isRenderable: true }, [
        function (patterns, options, next) {
          next(null, globber(patterns, options));
        },
        function (file, next) {
          // do stuff
          next(null, file);
        }
      ]);
    });

    it('should expose `err`:', function () {
      template.create('post', { isRenderable: true }, [
        function (patterns, options, next) {
          next(null, globber(patterns, options));
        },
        function (file, next) {
          // do stuff
          next(null, file);
        }
      ], function (err, result) {
         // result now equals 'done'
      });
    });

    it('should add functions on individual templates to the `subtype` loader stack:', function () {
      template.create('post', { isRenderable: true }, [
        function (patterns, options, next) {
          next(null, globber(patterns, options));
        },
        function (file, next) {
          // do stuff
          next(null, file);
        }
      ], function (err, result) {
         // result now equals 'done'
      });

      template.pages('test/fixtures/*.md', {a: 'b'}, [
        function (file, next) {
          // do stuff wit file
        }
      ]);
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
