/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

/* deps:mocha */
var assert = require('assert');
var should = require('should');
var template = require('./');

describe('template', function () {
  it('should:', function () {
    template('a').should.eql({a: 'b'});
    template('a').should.equal('a');
  });

  it('should throw an error:', function () {
    (function () {
      template();
    }).should.throw('template expects valid arguments');
  });
});
