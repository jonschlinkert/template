/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var through = require('through2');
var isStream = require('is-stream');
var File = require('vinyl');
var Template = require('./app');
var template;

describe('.renderFile', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should return a stream:', function () {
    assert.equal(isStream(template.renderFile()), true);
  });

  it('should render a vinyl file:', function (done) {
    var stream = through.obj();
    var buffer = [];

    stream.write(new File({
      base: __dirname,
      path: __dirname + '/a.md',
      contents: new Buffer('abc')
    }));

    stream
      .pipe(template.renderFile())
      .on('data', function (file) {
        buffer.push(file);
      })

    stream.on('end', function () {
      assert.equal(buffer[0].contents.toString(), 'abc');
      done();
    });
    stream.end();
  });
  it('should render templates in a vinyl file:', function (done) {
    var stream = through.obj();
    var buffer = [];

    stream.write(new File({
      base: __dirname,
      path: __dirname + '/a.md',
      contents: new Buffer('<%= a %>')
    }));

    var file = new File({
      base: __dirname,
      path: __dirname + '/b.md',
      contents: new Buffer('<%= c %>')
    });

    file.data = {c: 'd'};
    stream.write(file);

    stream
      .pipe(template.renderFile({a: 'b'}))
      .on('data', function (file) {
        buffer.push(file);
      })

    stream.on('end', function () {
      assert.equal(buffer[0].contents.toString(), 'b');
      assert.equal(buffer[1].contents.toString(), 'd');
      done();
    });
    stream.end();
  });
});
