/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template = new Template();

describe('default middleware:', function () {
  beforeEach(function () {
    template = new Template();
    template.create('page', [function (file, next) {
      next(null, file);
    }]);
  });

  it('should get throw an error with bad content.', function () {
    var stdout = process.stdout.write;
    var output = [];
    process.stdout.write = function (msg) {
      output.push(msg);
    };
    template.pages({'bad.md': {path: 'bad.md', content: {}}});
    process.stdout.write = stdout;
    output.length.should.eql(2);
    output[0].indexOf('Error running middleware for bad.md').should.not.eql(-1);
  });
});
