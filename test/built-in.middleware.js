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
    template.create('page', { isRenderable: true}, function (obj) {
      return obj;
    });
  });

  it('should get throw an error with bad content.', function () {
    var stderr = process.stderr.write;
    var output = [];
    process.stderr.write = function (msg) {
      output.push(msg);
    };
    template.pages({'bad.md': {path: 'bad.md', content: {}}});
    process.stderr.write = stderr;
    output.length.should.eql(2);
    output[0].indexOf('Error running middleware for bad.md').should.not.eql(-1);
  });
});
