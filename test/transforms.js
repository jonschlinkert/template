/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var Template = require('../');
var template;

describe('transforms', function () {
  describe('errors:', function () {
    beforeEach(function () {
      template = new Template();
    });

    it('should throw an error when args are invalid:', function () {
      (function () {
        template.transform();
      }).should.throw('Template#transform: expects name to be a string');
    });
  });
});
