'use strict';

/* deps: mocha */
var fs = require('fs');
var assert = require('assert');
var should = require('should');
var glob = require('globby');
var App = require('..');
var app

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
    app.handler('foo');

    app.foo(/./, function (file, next) {
      console.log(file)
      next();
    });

    app.pages('foo', {path: 'foo', content: 'this is content'});

    app.pages('test/fixtures/*.txt', function (pattern) {
      var opts = { cwd: process.cwd() };
      var collection = this;

      glob.sync(pattern, opts).forEach(function (fp) {
        var view = {path: fp, content: fs.readFileSync(fp, 'utf8')}

        app.handle('foo', view);
        collection[fp] = view;
      });
    });
  });
});
