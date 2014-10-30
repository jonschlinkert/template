/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var should = require('should');
var Template = require('..');
var template = new Template();


describe('default engines', function() {
  it('should register default engines automatically.', function() {
    template.engines.should.have.properties(['.md', '.html', '.*']);
  });
});

