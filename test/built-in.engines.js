/*!
 * engine-engines <https://github.com/jonschlinkert/engine-engines>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var should = require('should');
var Engine = require('..');
var template = new Engine();


describe('default engines', function() {
  it('should register default engines automatically.', function() {
    template.engines.should.have.properties(['.md', '.html', '.*']);
  });
});

