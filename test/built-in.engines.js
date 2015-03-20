/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
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
    template.engines.should.have.properties(['.*', '.md']);
  });

  it.skip('should disable default engines.', function() {
    template.disable('default engines');
    template.engines.should.not.have.properties(['.*', '.md']);
  });
});

