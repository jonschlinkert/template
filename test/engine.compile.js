/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var consolidate = require('consolidate');
var Template = require('./app');
var template;


describe('engine.compile():', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should compile content with an engine from [consolidate].', function () {
    template.engine('hbs', consolidate.handlebars);
    var hbs = template.getEngine('hbs');
    hbs.compile('{{name}}', {name: 'Jon Schlinkert'}).should.eql('{{name}}');
  });
});
