/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var Template = require('./app');
var template;

describe('validate:', function () {
  beforeEach(function () {
    template = new Template();
    template.create('page', { viewType: 'renderable' }, function (obj) {
      return obj;
    });
  });

  it('should throw an error when a template is missing path or content properties.', function () {
    var stderr = process.stderr.write;
    var output = [];
    process.stderr.write = function (msg) {
      output.push(msg);
    };
    template.enable('verbose');
    template.pages({'bad.md': {path: 'bad.md', content: {}}});
    process.stderr.write = stderr;
    output.length.should.eql(1);
    output[0].indexOf('onLoad').should.not.eql(-1);
  });
});
