/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var _ = require('lodash');


describe('.set():', function () {
  it('should register template helper functions:', function () {
    var template = new Template();
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

    helpers.set('a', function (str) {
      return str.toLowerCase();
    });

    helpers.set('b', function (str) {
      return str.toUpperCase();
    });
    console.log(template.helpers('*'))

    template.helpers.should.have.property('.a');
    template.helpers.should.have.property('.b');
    helpers.get('a').should.be.a.function;
    helpers.get('b').should.be.a.function;
  });

  it('should register _bound_ template helper functions by default:', function () {
    var template = new Template();

    template.set('a', function (str) {
      return str.toLowerCase();
    });

    template.set('b', function (str) {
      return str.toUpperCase();
    });

    template.helpers.should.have.property('.a');
    template.helpers.should.have.property('.b');
  });

  // it('should register _un-bound_ template helpers when `bindHelpers` is false:', function () {
  //   var template = new Template();
  //   template.option('bindHelpers', false);

  //   template.set('a', function (str) {
  //     return str.toLowerCase();
  //   });

  //   template.set('b', function (str) {
  //     return str.toUpperCase();
  //   });

  //   template.cache.helpers.should.have.property('a');
  //   template.cache.helpers.should.have.property('b');



  //   var lodash = template.getEngine('md');
  //   var ctx = {name: 'Jon Schlinkert'};

  //   lodash.render('<%= name %>', ctx, function (err, content) {
  //     content.should.equal('Jon Schlinkert');
  //     done();
  //   });


  // });

});
