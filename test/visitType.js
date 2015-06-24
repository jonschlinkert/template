'use strict';

/* deps: mocha */
var fs = require('fs');
var assert = require('assert');
var should = require('should');
var glob = require('globby');
var App = require('..');
var app

describe('mergeTypeContext', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('pages');

    app.onLoad(/./, function (file, next) {
      // console.log(file.options.collection)
      next();
    });
  })

  it('should map visit over all templates of the given viewType:', function () {
    app.pages('test/fixtures/*.txt', function (pattern) {
      var opts = { cwd: process.cwd() };
      return glob.sync(pattern, opts).reduce(function (acc, fp) {
        acc[fp] = {path: fp, content: fs.readFileSync(fp, 'utf8')}
        return acc;
      }, {});
    });
  });
});
