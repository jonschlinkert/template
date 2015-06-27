/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('./app');
var template;

describe('template.validate()', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should show an error when template object is null', function () {
    var output = [];
    var stderr = process.stderr.write;
    process.stderr.write = function (msg) {
      output.push(msg);
    }
    template.validate();
    process.stderr.write = stderr;
    if (process.env.DEBUG === 'template:err') output.length.should.not.be.eql(0);
  });

  it('should show an error when template object values are not objects', function () {
    var output = [];
    var stderr = process.stderr.write;
    process.stderr.write = function (msg) {
      output.push(msg);
    }
    template.validate({'foo': 1});
    process.stderr.write = stderr;
    if (process.env.DEBUG === 'template:err') output.length.should.not.be.eql(0);
  });

  it('should show an error when template object values do not contain a `path` property', function () {
    var output = [];
    var stderr = process.stderr.write;
    process.stderr.write = function (msg) {
      output.push(msg);
    }
    template.validate({'foo': { content: 'bar' }});
    process.stderr.write = stderr;
    if (process.env.DEBUG === 'template:err') output.length.should.not.be.eql(0);
  });

  it('should show an error when template object values do not contain a `content` property', function () {
    var output = [];
    var stderr = process.stderr.write;
    process.stderr.write = function (msg) {
      output.push(msg);
    }
    template.validate({'foo': { path: 'foo' }});
    process.stderr.write = stderr;
    if (process.env.DEBUG === 'template:err') output.length.should.not.be.eql(0);
  });

});
