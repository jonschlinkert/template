/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Engine = require('..');
var engine;


describe('.addHelper():', function () {
  beforeEach(function () {
    engine = new Engine();
  });

  it('should register _bound_ helper functions by default:', function () {
    var helpers = engine.helpers('*');
    helpers.addHelper('a', function () {});
    helpers.addHelper('b', function () {});

    helpers.should.have.properties(['a', 'b']);
  });

  it('should register _un-bound_ helpers when `bindHelpers` is false:', function () {
    engine.option('bindHelpers', false);
    var helpers = engine.helpers('*');

    helpers.addHelper('a', function () {});
    helpers.addHelper('b', function () {});
    helpers.should.have.properties(['a', 'b']);
  });

  it('should use helpers in templates:', function (done) {
    engine.option('bindHelpers', false);
    var helpers = engine.helpers('md');

    helpers.addHelper('upper', function (str) {
      return str.toUpperCase();
    });

    var lodash = engine.getEngine('md');

    lodash.render('<%= upper(name) %>', {name: 'Halle Nicole'}, function (err, content) {
      if (err) console.log(err);
      content.should.equal('HALLE NICOLE');
      done();
    });
  });
});
