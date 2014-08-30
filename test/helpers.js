/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template = new Template();
var _ = require('lodash');


describe('.addHelper():', function () {
  beforeEach(function () {
    template.init();
  });

  it('should register template helper functions:', function () {

    template.engine('a', {
      render: function () {}
    });
    template.engine('b', {
      render: function () {}
    });
    template.engine('c', {
      render: function () {}
    });
    template.engine('d', {
      render: function () {}
    });

    var helpers = template.helpers('*');

    helpers.addHelper('a', function (str) {
      return str.toLowerCase();
    });

    helpers.addHelper('b', function (str) {
      return str.toUpperCase();
    });

    helpers.should.have.property('a');
    helpers.should.have.property('b');
    helpers.getHelper('a').should.be.a.function;
    helpers.getHelper('b').should.be.a.function;
  });

  it('should register _bound_ template helper functions by default:', function () {
    var helpers = template.helpers('*');

    helpers.addHelper('a', function (str) {
      return str.toLowerCase();
    });

    helpers.addHelper('b', function (str) {
      return str.toUpperCase();
    });

    helpers.should.have.property('a');
    helpers.should.have.property('b');
  });

  it('should register _un-bound_ template helpers when `bindHelpers` is false:', function (done) {
    template.option('bindHelpers', false);

    var helpers = template.helpers('*');
    helpers.addHelper('a', function (str) {
      return str.toLowerCase();
    });

    helpers.addHelper('b', function (str) {
      return str.toUpperCase();
    });

    helpers.should.have.property('a');
    helpers.should.have.property('b');

    var lodash = template.getEngine('md');
    var ctx = {name: 'Jon Schlinkert'};

    lodash.render('<%= name %>', ctx, function (err, content) {
      if (err) console.log(err);
      content.should.equal('Jon Schlinkert');
      done();
    });
  });
});
