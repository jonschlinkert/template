/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;


describe('.addHelper():', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should register _bound_ helper functions by default:', function () {
    var helpers = template.helpers('*');
    helpers.addHelper('a', function () {});
    helpers.addHelper('b', function () {});

    helpers.should.have.properties(['a', 'b']);
  });

  it('should register _un-bound_ helpers when `bindHelpers` is false:', function () {
    template.option('bindHelpers', false);
    var helpers = template.helpers('*');

    helpers.addHelper('a', function () {});
    helpers.addHelper('b', function () {});
    helpers.should.have.properties(['a', 'b']);
  });

  it('should use helpers in templates:', function (done) {
    template.option('bindHelpers', false);
    var helpers = template.helpers('md');

    helpers.addHelper('upper', function (str) {
      return str.toUpperCase();
    });

    var lodash = template.getEngine('md');

    lodash.render('<%= upper(name) %>', {name: 'Halle Nicole'}, function (err, content) {
      if (err) console.log(err);
      content.should.equal('HALLE NICOLE');
      done();
    });
  });
});
