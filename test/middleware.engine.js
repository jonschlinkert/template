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
var pretty = require('verb-prettify');
var utils = require('template-utils')._;
var Template = require('./app');
var template;
var tokens;


describe('middleware', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('engine', function () {
    it('should set `file.engine` using the file extension:', function () {
      var file = utils.toVinyl({path: 'abc.md', content: 'xyz'});
      template.page('foo', utils.toTemplate(file));

      var tmpl = template.views.pages.foo;
      template.render(tmpl, function (err, content) {
        if (err) console.log(err);
        tmpl.should.have.property('engine');
        tmpl.engine.should.equal('.md');
      });
    });

    it('should set `file.engine` using `file.ext`:', function () {
      var file = utils.toVinyl({path: 'abc.md', content: 'xyz', ext: 'hbs'});
      template.page('a', utils.toTemplate(file));

      var tmpl = template.views.pages.a;
      template.render(tmpl, function (err, content) {
        if (err) console.log(err);
        tmpl.should.have.property('engine');
        tmpl.engine.should.equal('.hbs');
      });
    });

    it('should move `file.locals.engine` to `file.engine`:', function () {
      var file = utils.toVinyl({path: 'abc.md', content: 'xyz', ext: 'hbs', locals: {engine: 'swig'}});
      template.page('b', utils.toTemplate(file));

      var tmpl = template.views.pages.b;
      template.render(tmpl, function (err, content) {
        if (err) console.log(err);
        tmpl.should.have.property('engine');
        tmpl.engine.should.equal('.swig');
      });
    });

    it('should set `file.engine` using `file.engine`:', function () {
      var file = utils.toVinyl({path: 'abc.md', content: 'xyz', engine: 'swig'});
      template.page('c', utils.toTemplate(file));

      var tmpl = template.views.pages.c;
      template.render(tmpl, function (err, content) {
        if (err) console.log(err);
        tmpl.should.have.property('engine');
        tmpl.engine.should.equal('.swig');
      });
    });
  });
});
