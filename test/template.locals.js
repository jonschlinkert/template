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
var Template = require('./app');
var template;

describe('template locals', function () {
  beforeEach(function () {
    template = new Template();
    template.engine('md', require('engine-lodash'));
  });

  describe('context:', function () {
    it('should pass data to templates from locals:', function (done) {
      template.page('aaa.md', 'foo <%= abc %> bar', { abc: 'xyz'});

      template.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('foo xyz bar');
        done();
      });
    });
  });
});
