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


describe('.registerHelper():', function () {
  it('should register template helper functions:', function () {
    var template = new Template();

    template.registerHelper('a', function (str) {
      return str.toLowerCase();
    });

    template.registerHelper('b', function (str) {
      return str.toUpperCase();
    });

    console.log(template)
    // template.cache.helpers.should.have.property('a');
    // template.cache.helpers.should.have.property('b');
  });

  // it('should register _bound_ template helper functions by default:', function () {
  //   var template = new Template();

  //   template.registerHelper('a', function (str) {
  //     return str.toLowerCase();
  //   });

  //   template.registerHelper('b', function (str) {
  //     return str.toUpperCase();
  //   });

  //   template.cache.helpers.should.have.property('a');
  //   template.cache.helpers.should.have.property('b');


  // });

  // it('should register _un-bound_ template helpers when `bindHelpers` is false:', function () {
  //   var template = new Template();
  //   template.option('bindHelpers', false);

  //   template.registerHelper('a', function (str) {
  //     return str.toLowerCase();
  //   });

  //   template.registerHelper('b', function (str) {
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
