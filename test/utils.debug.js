/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var debug = require('../lib/debug');

// setup a way to capture output
var output = [];
var stderr = process.stderr.write;
function write (msg) {
  output.push(msg);
}

describe('template utils debug', function() {
  beforeEach(function () {
    output = [];
    process.stderr.write = write;
  });
  afterEach(function () {
    process.stderr.write = stderr;
    output = [];
  });
  describe('.debug:', function () {
    it('should write out a debug message:', function () {
      debug.err('This is an error');
    });
    it('should write out a debug message with bold formatting:', function () {
      debug.err('#{This is a bold error}');
    });
  });
});
