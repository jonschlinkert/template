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


describe('template data', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('.data():', function () {
    it('should load data from an object:', function () {
      template.data({a: 'b'});
      console.log(template)
    });

    it.skip('should load data from a JSON file:', function () {
    });

    it.skip('should load data from a YAML file:', function () {
    });

    it.skip('should namespace data from an object:', function () {
    });

    it.skip('should namespace data from a file:', function () {
    });

    it.skip('should pass data to templates:', function () {
    });

    it.skip('should give preference to locals over "global" data:', function () {
    });

    it.skip('should give preference to front matter over locals:', function () {
    });
  });
});
