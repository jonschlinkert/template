'use strict';

/* deps: mocha */
var fs = require('fs');
var extend = require('extend-shallow');
var assert = require('assert');
var should = require('should');
var glob = require('globby');
var App = require('..');
var app;

describe('handlers', function () {
  describe('custom handlers', function () {
    beforeEach(function () {
      app = new App();
      app.engine('tmpl', require('engine-lodash'));
      app.create('page');
    });

    it('should add custom middleware handlers:', function () {
      app.handler('foo');
      app.router.should.have.property('foo');
      assert.equal(typeof app.router.foo, 'function');
    });

    it('should add custom middleware handlers:', function () {
      app.option('defaultLoader', false);
      app.handler('foo');

      app.foo(/./, function (file, next) {
        file.foo = 'bar';
        next();
      });

      app.pages('test/fixtures/*.txt', { cwd: process.cwd() }, function (views, options) {
        return function (pattern, opts) {
            extend(options, opts);

            glob.sync(pattern, opts).forEach(function (fp) {
              var view = {path: fp, content: fs.readFileSync(fp, 'utf8')}

              app.handle('foo', view);
              views.set(fp, view);
            });

            return views;
          };
        })
        .pages('test/fixtures/*.md', function (views, options) {
          return function () {
            return views;
          }
        })

      // app.pages('foo', {path: 'foo', content: 'this is content'});
      var page = app.pages.get('c.txt');
      console.log(page)
    });
  });
});
