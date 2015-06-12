/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var Template = require('./app');
var template;


describe('app engines', function() {
  beforeEach(function () {
    template = new Template();
  });

  it('should register engines automatically.', function() {
    template.engine('a', function () {});
    template.engine('b', function () {});
    template.engine('c', function () {});
    template.engines.should.have.properties(['.a', '.b', '.c']);
  });

  it.skip('should disable  engines.', function() {
    template.disable('default engines');
    template.engines.should.not.have.property('.*');
  });
});

