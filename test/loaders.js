/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
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

describe('template locals', function () {
  beforeEach(function (done) {
    template = new Template();
    done();
  });

  describe('when a custom loader function is set:', function () {
    it('should load using the custom loader', function () {
      var template = new Template();
      var loader = require('./lib/load-npm');

      template.create('npm', { loadFn: loader });

      template.npm(__dirname + '/fixtures/loaders/npm-load.json');
      template.npm(__dirname + '/fixtures/loaders/npm-load.js');
      template.npm(__dirname + '/fixtures/loaders/npm-load.css');

      template.cache.npms.should.have.properties(['npm-load.js', 'npm-load.json', 'npm-load.css']);
    });
  });
});
