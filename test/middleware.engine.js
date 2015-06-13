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
var pretty = require('verb-prettify');
var toTemplate = require('to-template');
var toVinyl = require('to-vinyl');
var Template = require('./app');
var template;
var tokens;


describe('middleware', function () {
  beforeEach(function () {
    template = new Template();
    template.engine('*', require('engine-lodash'));
  });

  describe('engine', function () {
    it('should set `file.engine` using the file extension:', function () {
      var file = toVinyl({path: 'abc.md', content: 'xyz'});
      template.page('foo', toTemplate(file));

      var tmpl = template.views.pages.foo;
      template.render(tmpl, function (err, content) {
        if (err) console.log(err);
        tmpl.should.have.property('engine');
        tmpl.engine.should.equal('.md');
      });
    });

    it('should set `file.engine` using `file.ext`:', function () {
      var file = toVinyl({path: 'abc.md', content: 'xyz', engine: 'hbs'});
      template.page('a', toTemplate(file));

      var tmpl = template.views.pages.a;
      template.render(tmpl, function (err, content) {
        if (err) console.log(err);
        tmpl.should.have.property('engine');
        tmpl.engine.should.equal('.hbs');
      });
    });
  });
});
