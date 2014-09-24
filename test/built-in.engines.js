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
var Template = require('../tmpl');
var template = new Template();


describe('default engines', function() {
  it('should register default engines automatically.', function() {
    template.engines.should.have.property('.md');
    template.engines.should.have.property('.html');
    template.engines.should.have.property('.*');
    Object.keys(template.engines).length.should.equal(4);
  });
});

